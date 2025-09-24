import { environment } from '../../../environments/environment';

const apiUrl = environment.apiUrl;  

export const ApiEndpoint = {
    Auth: {
        Register: `${apiUrl}/users/register`,
        ForgotPassword: `${apiUrl}/users/forgot-password`,
        ResetPassword: `${apiUrl}/users/reset-password`,
        UpdateRevenue: `${apiUrl}/users/update-revenue`,
        UpdateAvatar: `${apiUrl}/users/update-avatar`,
        UpdateViewCount: `${apiUrl}/users/update-view-count`,
        ResetViewCount: `${apiUrl}/users/reset-view-count`,
        Login: `${apiUrl}/users/login`,
        Me: `${apiUrl}/users/me`
    },
    Admin: {
        UpdateInfluencersInDB: `${apiUrl}/admin/update-influencers-in-db`,
        AddInfluencersToDB: `${apiUrl}/admin/add-influencers-to-db`,
        TestImportFile: `${apiUrl}/admin/test-import-file`,
    },
    Actions: {
        convertToPDF: `${apiUrl}/actions/convert-to-pdf`,
        CreateNote: `${apiUrl}/actions/create-note`,
        UpdateNote: `${apiUrl}/actions/update-note`,
        DeleteNote: `${apiUrl}/actions/delete-note`,
        ReportBug: `${apiUrl}/actions/report-bug`,
        FeatureSuggestion: `${apiUrl}/actions/feature-suggestion`
    },
    PDF: {
        convertToPDF: environment.pdfApiUrl,
    },
    Campaigns: {
        CreateCampaign: `${apiUrl}/campaigns/create-campaign`,
        DeleteCampaign: `${apiUrl}/campaigns/delete-campaign`,
        UpdateCampaign: `${apiUrl}/campaigns/update-campaign`,
    },
    Events: {
        CreateEvent: `${apiUrl}/events/create-event`,
        DeleteEvent: `${apiUrl}/events/delete-event`,
        UpdateEvent: `${apiUrl}/events/update-event`,
        CompleteEvent: `${apiUrl}/events/complete-event`,
        IncompleteEvent: `${apiUrl}/events/incomplete-event`
    },
    Lists: {
        CreateList: `${apiUrl}/lists/create-list`,
        UpdateList: `${apiUrl}/lists/update-list`,
        DeleteList: `${apiUrl}/lists/delete-list`,
        DeleteInfluencerFromList: `${apiUrl}/lists/delete-influencer-from-list`,
    },
    Tasks: {
        CreateTask: `${apiUrl}/tasks/create-task`,
        EditTask: `${apiUrl}/tasks/edit-task`,
        UpdateTask: `${apiUrl}/tasks/update-task`,
        DeleteTask: `${apiUrl}/tasks/delete-task`,
    },
    Notes: {
        CreateNote: `${apiUrl}/notes/create-note`,
        EditNote: `${apiUrl}/notes/edit-note`,
        UpdateNote: `${apiUrl}/notes/update-note`,
        DeleteNote: `${apiUrl}/notes/delete-note`,
    },
    Influencers: {
        HideInfluencer: `${apiUrl}/influencers/hide`,
        UnhideInfluencer: `${apiUrl}/influencers/unhide`
    },
    Subscription: {
        SubscribeToPro: `${apiUrl}/subscribe-stripe-pro`,
        SubscribeToScale: `${apiUrl}/subscribe-stripe-scale`
    },
    Uploads: {
        Image: `${apiUrl}/uploads/image`
    },
    Organizations: {
        InviteUser: `${apiUrl}/organizations`,
        GetMembers: `${apiUrl}/organizations`
    },
    ApiKeys: {
        GetApiKeys: `${apiUrl}/api-keys`,
        CreateApiKey: `${apiUrl}/api-keys`,
        UpdateApiKey: `${apiUrl}/api-keys`,
        DeleteApiKey: `${apiUrl}/api-keys`
    }
}

export const LocalStorage = {
    token: 'USER_TOKEN'
}