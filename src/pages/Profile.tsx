
import React from 'react';
import Layout from '../components/Layout';
import { User, Package, Heart, CreditCard, LogOut, Settings } from 'lucide-react';

const Profile: React.FC = () => {
  return (
    <Layout>
      <div className="bg-secondary/50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="heading-2 mb-2 text-center">My Account</h1>
          <p className="text-center text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
          {/* Sidebar */}
          <aside>
            <div className="flex flex-col gap-1">
              <button className="flex items-center gap-3 px-4 py-2 rounded-md bg-primary/10 text-primary font-medium">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </button>
              
              <button className="flex items-center gap-3 px-4 py-2 rounded-md text-foreground/70 hover:bg-muted transition-colors">
                <Package className="h-5 w-5" />
                <span>Orders</span>
              </button>
              
              <button className="flex items-center gap-3 px-4 py-2 rounded-md text-foreground/70 hover:bg-muted transition-colors">
                <Heart className="h-5 w-5" />
                <span>Wishlist</span>
              </button>
              
              <button className="flex items-center gap-3 px-4 py-2 rounded-md text-foreground/70 hover:bg-muted transition-colors">
                <CreditCard className="h-5 w-5" />
                <span>Payment Methods</span>
              </button>
              
              <button className="flex items-center gap-3 px-4 py-2 rounded-md text-foreground/70 hover:bg-muted transition-colors">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
              
              <button className="flex items-center gap-3 px-4 py-2 rounded-md text-foreground/70 hover:bg-muted transition-colors">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
          
          {/* Main Content */}
          <div>
            <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="relative">
                      <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                    <button className="text-sm text-primary font-medium">
                      Change Image
                    </button>
                  </div>
                  
                  {/* Form */}
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                          First Name
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          defaultValue="John"
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          defaultValue="Doe"
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        defaultValue="john.doe@example.com"
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        defaultValue="+1 (555) 123-4567"
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <button className="button-primary">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border/40 p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-6">Address Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium mb-1">
                      Street Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      defaultValue="123 Main Street"
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-1">
                        City
                      </label>
                      <input
                        id="city"
                        type="text"
                        defaultValue="San Francisco"
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium mb-1">
                        State
                      </label>
                      <input
                        id="state"
                        type="text"
                        defaultValue="California"
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                        Zip Code
                      </label>
                      <input
                        id="zipCode"
                        type="text"
                        defaultValue="94105"
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button className="button-primary">
                      Update Address
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
