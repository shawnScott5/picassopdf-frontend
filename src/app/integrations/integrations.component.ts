import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { Router } from '@angular/router';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'connecting';
  storeName?: string;
  lastSync?: string;
  productsCount?: number;
  ordersCount?: number;
  revenue?: number;
}

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.scss']
})
export class IntegrationsComponent implements OnInit {
  integrations: Integration[] = [];
  connectedStores: Integration[] = [];
  availableIntegrations: Integration[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadIntegrations();
  }

  loadIntegrations() {
    this.availableIntegrations = [
      {
        id: 'shopify',
        name: 'Shopify',
        description: 'Connect your Shopify store to sync products, orders, and customer data',
        icon: 'shopify',
        status: 'disconnected'
      },
      {
        id: 'woocommerce',
        name: 'WooCommerce',
        description: 'Integrate with your WooCommerce store for seamless data synchronization',
        icon: 'woocommerce',
        status: 'disconnected'
      },
      {
        id: 'bigcommerce',
        name: 'BigCommerce',
        description: 'Connect your BigCommerce store to automate your marketing campaigns',
        icon: 'bigcommerce',
        status: 'disconnected'
      }
    ];

    this.connectedStores = [
      {
        id: 'shopify-1',
        name: 'Shopify',
        description: 'Connected to your main store',
        icon: 'shopify',
        status: 'connected',
        storeName: 'My Fashion Store',
        lastSync: '2 minutes ago',
        productsCount: 1247,
        ordersCount: 89,
        revenue: 24567
      },
      {
        id: 'woocommerce-1',
        name: 'WooCommerce',
        description: 'Connected to your WordPress site',
        icon: 'woocommerce',
        status: 'connected',
        storeName: 'Tech Gadgets Shop',
        lastSync: '5 minutes ago',
        productsCount: 892,
        ordersCount: 156,
        revenue: 18934
      }
    ];

    this.integrations = [...this.availableIntegrations, ...this.connectedStores];
  }

  connectStore(integration: Integration) {
    console.log('Connecting to:', integration.name);
    // Simulate connection process
    integration.status = 'connecting';
    
    setTimeout(() => {
      integration.status = 'connected';
      // Move to connected stores
      this.connectedStores.push({
        ...integration,
        id: `${integration.id}-${Date.now()}`,
        storeName: `${integration.name} Store`,
        lastSync: 'Just now',
        productsCount: Math.floor(Math.random() * 1000) + 100,
        ordersCount: Math.floor(Math.random() * 200) + 50,
        revenue: Math.floor(Math.random() * 50000) + 10000
      });
      
      // Remove from available integrations
      this.availableIntegrations = this.availableIntegrations.filter(i => i.id !== integration.id);
      
      // Update main integrations array
      this.integrations = [...this.availableIntegrations, ...this.connectedStores];
    }, 2000);
  }

  disconnectStore(integration: Integration) {
    console.log('Disconnecting from:', integration.name);
    
    // Move back to available integrations
    const disconnectedIntegration = {
      ...integration,
      status: 'disconnected' as const
    };
    
    this.availableIntegrations.push(disconnectedIntegration);
    
    // Remove from connected stores
    this.connectedStores = this.connectedStores.filter(i => i.id !== integration.id);
    
    // Update main integrations array
    this.integrations = [...this.availableIntegrations, ...this.connectedStores];
  }

  syncStore(integration: Integration) {
    console.log('Syncing store:', integration.name);
    integration.lastSync = 'Syncing...';
    
    setTimeout(() => {
      integration.lastSync = 'Just now';
      integration.productsCount = Math.floor(Math.random() * 1000) + 100;
      integration.ordersCount = Math.floor(Math.random() * 200) + 50;
      integration.revenue = Math.floor(Math.random() * 50000) + 10000;
    }, 1500);
  }

  viewStoreDetails(integration: Integration) {
    console.log('Viewing details for:', integration.name);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'connected': return '#16a34a';
      case 'connecting': return '#2563eb';
      case 'disconnected': return '#dc2626';
      default: return '#666';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  }
} 