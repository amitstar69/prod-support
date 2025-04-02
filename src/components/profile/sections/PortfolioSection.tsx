
import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Edit2, Plus, Trash2, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  tags: string[];
}

interface PortfolioSectionProps {
  portfolioItems: PortfolioItem[];
  onChange: (items: PortfolioItem[]) => void;
}

const PortfolioSection: React.FC<PortfolioSectionProps> = ({ portfolioItems = [], onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [newTag, setNewTag] = useState('');
  
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    setEditingItem(null);
  };
  
  const handleAddNew = () => {
    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      imageUrl: '',
      projectUrl: '',
      tags: []
    };
    setEditingItem(newItem);
  };
  
  const handleEditItem = (item: PortfolioItem) => {
    setEditingItem({...item});
  };
  
  const handleDeleteItem = (id: string) => {
    onChange(portfolioItems.filter(item => item.id !== id));
  };
  
  const handleInputChange = (field: keyof PortfolioItem, value: any) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        [field]: value
      });
    }
  };
  
  const handleAddTag = () => {
    if (editingItem && newTag.trim() && !editingItem.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...editingItem.tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    if (editingItem) {
      handleInputChange('tags', editingItem.tags.filter(t => t !== tag));
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleSaveItem = () => {
    if (editingItem) {
      const isNew = !portfolioItems.some(item => item.id === editingItem.id);
      const updatedItems = isNew 
        ? [...portfolioItems, editingItem]
        : portfolioItems.map(item => item.id === editingItem.id ? editingItem : item);
      
      onChange(updatedItems);
      setEditingItem(null);
    }
  };
  
  const handleCancel = () => {
    setEditingItem(null);
  };
  
  return (
    <Card className="border border-border/40 shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">Portfolio</h2>
          {!editingItem && (
            <Button variant="ghost" size="sm" onClick={handleToggleEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditing ? 'Done' : 'Edit'}
            </Button>
          )}
        </div>
        
        {editingItem ? (
          <div className="space-y-4 border rounded-md p-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Title</label>
              <input
                type="text"
                value={editingItem.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="E.g. E-commerce Website"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={editingItem.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
                rows={3}
                placeholder="Describe the project, your role, and technologies used"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  value={editingItem.imageUrl || ''}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="https://"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Project URL (Optional)</label>
                <input
                  type="text"
                  value={editingItem.projectUrl || ''}
                  onChange={(e) => handleInputChange('projectUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="https://"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-3 py-2 border border-border rounded-md"
                  placeholder="E.g. React, Tailwind, API"
                />
                <Button onClick={handleAddTag}>Add</Button>
              </div>
              
              {editingItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editingItem.tags.map((tag, index) => (
                    <div key={index} className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm flex items-center">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:bg-primary/20 rounded-full p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSaveItem}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {portfolioItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolioItems.map((item) => (
                  <div key={item.id} className="border rounded-md overflow-hidden group">
                    {item.imageUrl && (
                      <div className="h-48 bg-muted overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{item.title}</h3>
                        
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ) : item.projectUrl && (
                          <a 
                            href={item.projectUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                      
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag, index) => (
                            <span key={index} className="bg-secondary/50 text-secondary-foreground rounded-full px-2 py-0.5 text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {item.projectUrl && !isEditing && (
                        <div className="mt-3">
                          <a 
                            href={item.projectUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline inline-flex items-center"
                          >
                            <LinkIcon className="h-3 w-3 mr-1" />
                            View Project
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                Add portfolio items to showcase your previous work to potential clients
              </p>
            )}
            
            {isEditing && (
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Portfolio Item
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioSection;
