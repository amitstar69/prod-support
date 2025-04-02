
import { Dispatch, SetStateAction } from 'react';
import { Developer, Client } from '../../types/product';
import { AuthState } from '../../types/product';

/**
 * Register a user using localStorage (fallback method)
 */
export const registerWithLocalStorage = (
  userData: Partial<Developer | Client>, 
  userType: 'developer' | 'client',
  mockDevelopers: Developer[],
  mockClients: Client[],
  setMockDevelopers: Dispatch<SetStateAction<Developer[]>>,
  setMockClients: Dispatch<SetStateAction<Client[]>>,
  setAuthState: Dispatch<SetStateAction<AuthState>>
): boolean => {
  if (userType === 'developer') {
    const developerData = userData as Partial<Developer>;
    
    const newDev = {
      id: `dev-${Date.now()}`,
      name: developerData.name || '',
      hourlyRate: 75,
      image: '/placeholder.svg',
      category: developerData.category || 'frontend',
      skills: developerData.skills || ['JavaScript', 'React'],
      experience: developerData.experience || '3 years',
      description: developerData.description || '',
      rating: 4.5,
      availability: true,
      email: developerData.email,
      ...developerData,
    } as Developer;
    
    const updatedDevelopers = [...mockDevelopers, newDev];
    setMockDevelopers(updatedDevelopers);
    localStorage.setItem('mockDevelopers', JSON.stringify(updatedDevelopers));
    
    setAuthState({
      isAuthenticated: true,
      userType: 'developer',
      userId: newDev.id,
    });
    
    localStorage.setItem('authState', JSON.stringify({
      isAuthenticated: true,
      userType: 'developer',
      userId: newDev.id,
    }));
    
    return true;
  } else {
    const clientData = userData as Partial<Client>;
    
    const newClient = {
      id: `client-${Date.now()}`,
      name: clientData.name || '',
      email: clientData.email || '',
      joinedDate: new Date().toISOString(),
      ...clientData,
    } as Client;
    
    const updatedClients = [...mockClients, newClient];
    setMockClients(updatedClients);
    localStorage.setItem('mockClients', JSON.stringify(updatedClients));
    
    setAuthState({
      isAuthenticated: true,
      userType: 'client',
      userId: newClient.id,
    });
    
    localStorage.setItem('authState', JSON.stringify({
      isAuthenticated: true,
      userType: 'client',
      userId: newClient.id,
    }));
    
    return true;
  }
};
