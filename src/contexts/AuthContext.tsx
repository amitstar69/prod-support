
export const updateUserData = async (userData: Partial<Developer | Client>): Promise<boolean> => {
  const { isAuthenticated, userType, userId } = JSON.parse(localStorage.getItem('authState') || '{}');
  
  if (!isAuthenticated || !userId) return false;
  
  if (supabaseUrl && supabaseKey) {
    const { error } = await supabase.from('profiles').update(userData).eq('id', userId);
    if (error) {
      console.error('Error updating user data:', error);
      return false;
    }
    return true;
  } else {
    // Fallback to localStorage
    if (userType === 'developer') {
      const developers = JSON.parse(localStorage.getItem('mockDevelopers') || '[]');
      const index = developers.findIndex((dev: Developer) => dev.id === userId);
      
      if (index !== -1) {
        developers[index] = { ...developers[index], ...userData };
        localStorage.setItem('mockDevelopers', JSON.stringify(developers));
        return true;
      }
    } else {
      const clients = JSON.parse(localStorage.getItem('mockClients') || '[]');
      const index = clients.findIndex((client: Client) => client.id === userId);
      
      if (index !== -1) {
        clients[index] = { ...clients[index], ...userData };
        localStorage.setItem('mockClients', JSON.stringify(clients));
        return true;
      }
    }
  }
  
  return false;
};
