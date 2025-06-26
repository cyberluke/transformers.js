class SelfHostedMem0 {
  private appName: string = "openmemory"; // Default app name from API spec
  
  constructor(private baseURL: string) {}
  
  async addMemories(messages: any[], userId: string) {
    try {
      // Extract text content from the last message to create a memory
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || !lastMessage.content) {
        return [];
      }

      // Extract text from the message content
      let text = '';
      if (typeof lastMessage.content === 'string') {
        text = lastMessage.content;
      } else if (Array.isArray(lastMessage.content)) {
        // Handle content array format
        text = lastMessage.content
          .filter((item: any) => item.type === 'text')
          .map((item: any) => item.text)
          .join(' ');
      }

      if (!text.trim()) {
        return [];
      }

      const response = await fetch(`${this.baseURL}/api/v1/memories/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          text: text,
          app: this.appName,
          metadata: {},
          infer: true
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to add memories:', response.status, response.statusText, errorText);
        
        // If user not found, try to create user by making a simple request first
        if (response.status === 404 && errorText.includes("User not found")) {
          console.log('User not found, attempting to initialize user...');
          // Try to get user stats first to potentially create the user
          await this.initializeUser(userId);
          
          // Retry the memory creation
          const retryResponse = await fetch(`${this.baseURL}/api/v1/memories/`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              user_id: userId,
              text: text,
              app: this.appName,
              metadata: {},
              infer: true
            })
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            return Array.isArray(retryData) ? retryData : (retryData.results ? retryData.results : []);
          }
        }
        
        return [];
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : (data.results ? data.results : []);
    } catch (error) {
      console.error('Error adding memories:', error);
      return [];
    }
  }
  
  async getMemories(messages: any[], userId: string) {
    try {
      // Get existing memories for the user - only user_id is required
      const params = new URLSearchParams({
        user_id: userId
      });

      const listResponse = await fetch(`${this.baseURL}/api/v1/memories/?${params.toString()}`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        }
      });
      
      if (!listResponse.ok) {
        const errorText = await listResponse.text();
        console.error('Failed to fetch memories:', listResponse.status, listResponse.statusText, errorText);
        
        // If user not found, try to initialize user
        if (listResponse.status === 404 && errorText.includes("User not found")) {
          console.log('User not found during fetch, attempting to initialize user...');
          await this.initializeUser(userId);
          // Return empty array for now, user will be ready for next request
        }
        
        return [];
      }
      
      const data = await listResponse.json();
      
      // Handle the paginated response format from API spec
      if (data && Array.isArray(data.items)) {
        return data.items.map((item: any) => ({
          memory: item.content || item.memory || item.text || String(item),
          ...item
        }));
      } else if (Array.isArray(data)) {
        return data.map((item: any) => ({
          memory: item.content || item.memory || item.text || String(item),
          ...item
        }));
      } else {
        console.warn('Unexpected response format from memories API:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching memories:', error);
      return [];
    }
  }
  
  private async initializeUser(userId: string) {
    try {
      // Try to get user stats to potentially initialize the user
      const statsResponse = await fetch(`${this.baseURL}/api/v1/stats/?user_id=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        }
      });
      
      if (statsResponse.ok) {
        console.log('User stats retrieved, user should now be initialized');
      } else {
        console.log('Could not initialize user through stats endpoint');
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  }
}

export default SelfHostedMem0;