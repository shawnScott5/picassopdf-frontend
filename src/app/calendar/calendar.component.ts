import { ChangeDetectorRef, Component, OnInit, ViewContainerRef } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi, EventInput } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { createPopper } from "@popperjs/core";
import { TruncatePipeCalendar } from './truncate.pipe';
import { MatRadioModule } from '@angular/material/radio';
import { EventsService } from '../create-new-event/create-new-event.service';
import { AuthService } from '../core/services/auth.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CreateNewEventComponent } from '../create-new-event/create-new-event.component';
import { BehaviorSubject } from 'rxjs';

let self: any;
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, NgIf, TruncatePipeCalendar, MatRadioModule, NgClass, CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  private eventChannel = new BroadcastChannel('event_updates');
  tooltipMessage: any = '';
  tooltip: any;
  popperInstance: any;
  allEvents: any;
  eventGuid: number = 0;
  isMonthView: boolean = true;
  // Use BehaviorSubject to manage the events array
  currentEvents = new BehaviorSubject<EventApi[]>([]);
  // Use BehaviorSubject to manage the visibility state
  calendarVisible = new BehaviorSubject<boolean>(false);
  calendarOptions: any;
  isPageLoading: boolean = true;
  userId: any;
  query: any = {
    userId: ''
  };

  constructor(
    private changeDetector: ChangeDetectorRef, 
    private _EventService: EventsService, 
    private authService: AuthService, 
    private _viewContainerRef: ViewContainerRef, 
    private _dialog: MatDialog, 
    private cdr: ChangeDetectorRef
  ) {
    self = this;
  }

  ngOnInit() {
    this.tooltip = document.querySelector('#tooltip'); // Ensure this ID matches your tooltip element in HTML
    this.fetchUserAndEvents();

    // Listen for event updates
    this.eventChannel.onmessage = (message) => {
      if (message.data.eventAdded) {
        this.fetchEvents();
      }
    };
  }

  async fetchUserAndEvents() {
    try {
      const userResponse = await this.authService.me().toPromise();
      this.userId = userResponse?.data._id;
      this.query.userId = userResponse?.data._id;

      // Fetch events after the user data is available
      await this.fetchEvents();
    } catch (error) {
    }
  }

  async fetchEvents() {
    try {
      const eventsResponse: any = await this._EventService.fetchMyEvents(this.query).toPromise();
      const formattedEvents: any = [];
      this.allEvents = eventsResponse;

      if (eventsResponse?.data?.length) {
        for (let event of eventsResponse.data) {
          const eventStartTime = this.combineDateAndTime(event.startDate, event.startTime);
          const isPastEvent = eventStartTime < new Date();

          formattedEvents.push({
            title: event.name || event.title,
            start: event.startDate,
            end: event.endDate,
            extendedProps: {
              _id: event._id,
              customTime: this.convertTo12HourFormat(event.startTime),
              isPastEvent: isPastEvent || event.isComplete
            }
          });
        }
      }

      // ✅ Update the events dynamically instead of reinitializing
      if (this.calendarOptions) {
        this.calendarOptions.events = formattedEvents;
      } else {
        this.initializeCalendar(formattedEvents);
      }

      this.isPageLoading = false;
      this.cdr.detectChanges(); // Ensure Angular detects the update
    } catch (error) {
      this.isPageLoading = false;
      this.initializeCalendar([]); // Initialize with empty events if there's an error
    }
  }

  combineDateAndTime(dateString: string, timeString: string): Date {
    // Convert date string to a Date object
    let date = new Date(dateString);

    // Extract the year, month, and day from the existing date
    let [year, month, day] = [
        date.getFullYear(),
        date.getMonth(), // getMonth() is zero-based
        date.getDate()
    ];

    // Extract hours and minutes from the military time string
    let [hours, minutes] = timeString.split(':').map(Number);

    // Create a new Date object with the combined date and time in local timezone
    return new Date(year, month, day, hours, minutes, 0);
  }

  convertTo12HourFormat(time: string): string {
    if (!time) return ''; // Handle empty or undefined time values
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12; // Convert 0 (midnight) and 12 (noon) correctly
    return `${formattedHours}:${minutes.toString().padStart(2, '0')}${period}`;
  }

  initializeCalendar(events: any[]) {
    this.calendarOptions = {
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listWeek'
      },
      initialView: 'dayGridMonth',
      initialEvents: events, // Set fetched events
      eventColor: '#12e19f',
      eventBorderColor: '#12e19f',
      eventBackgroundColor: '#12e19f',
      eventTextColor: '#fff',
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      //select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventMouseEnter: (el: any) => {
        this.tooltipMessage = el.event.title;
        this.tooltip.setAttribute('data-show', '');
        this.popperInstance = createPopper(el.el, this.tooltip, {
          placement: 'top',
        });
      },
      eventMouseLeave: (el: any) => {
        if (this.popperInstance) {
          this.tooltipMessage = null;
          this.popperInstance.destroy();
          this.popperInstance = null;
          this.tooltip.removeAttribute('data-show');
        }
      },
      eventsSet: this.handleEvents.bind(this)
    };
    this.calendarVisible.next(true);
  }

  handleCalendarToggle() {
    this.calendarVisible.next(!this.calendarVisible.value);

  }

  handleWeekendsToggle() {
    this.calendarOptions.update((options: any) => ({
      ...options,
      weekends: !options.weekends,
    }));
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: '123',
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      });
    }
  }

  // open update event modal
  async handleEventClick(clickInfo: EventClickArg) {
    let eventId = clickInfo.event.extendedProps['_id'];
    let eventMatch: any;
    for(let event of this.allEvents.data) {
      if(event._id == eventId) {
        eventMatch = event;
      }
    }
    this.openUpdateEvent(eventMatch);
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.next(events);
    this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
  }

  formatTimeTo12Hour(dateTime: string): string {
    const date = new Date(dateTime);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12; // Convert 0 to 12 for 12 AM/PM
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  }

  createEventId() {
    return String(this.eventGuid++);
  }

  openUpdateEvent(event: any) {
    const config = new MatDialogConfig();
   
     config.autoFocus = false;
     config.disableClose = false;
     config.viewContainerRef = this._viewContainerRef;
     config.hasBackdrop = true;
     config.minWidth = '56vw';
     config.maxWidth = '56vw';
     config.minHeight = '58vh';
     config.maxHeight = '58vh';
     config.panelClass = 'custom-dialog-container';
     self.dialogRef = this._dialog.open(CreateNewEventComponent, config);
     self.dialogRef.componentInstance.event = event;
     self.dialogRef.componentInstance.userId = this.userId;
     self.dialogRef
     .afterClosed()
     .subscribe((result: any) => {
       self.dialogRef = null;
       if (result) {
         this.fetchEvents();
       }
     });
 }

  openCreateEvent() {
       const config = new MatDialogConfig();
      
       config.autoFocus = false;
       config.disableClose = false;
       config.viewContainerRef = this._viewContainerRef;
       config.hasBackdrop = true;
       config.minWidth = '50vw';
       config.maxWidth = '50vw';
       config.minHeight = '58vh';
       config.maxHeight = '58vh';
       config.panelClass = 'custom-dialog-container';
        self.dialogRef = this._dialog.open(CreateNewEventComponent, config);
        self.dialogRef.componentInstance.data = [];
        self.dialogRef.componentInstance.userId = this.userId;
        self.dialogRef
        .afterClosed()
        .subscribe((result: any) => {
          self.dialogRef = null;
          if (result) {
            this.fetchEvents();
          }
        });
    }
}
