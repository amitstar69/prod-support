
import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Edit2, Plus, Trash2 } from 'lucide-react';

interface Language {
  id: string;
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

interface LanguagesSectionProps {
  languages: Language[];
  onChange: (languages: Language[]) => void;
}

const proficiencyLevels = [
  { value: 'Basic', label: 'Basic' },
  { value: 'Conversational', label: 'Conversational' },
  { value: 'Fluent', label: 'Fluent' },
  { value: 'Native', label: 'Native' }
];

const LanguagesSection: React.FC<LanguagesSectionProps> = ({ languages = [], onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Language | null>(null);
  
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    setEditingItem(null);
  };
  
  const handleAddNew = () => {
    const newItem: Language = {
      id: Date.now().toString(),
      name: '',
      proficiency: 'Fluent'
    };
    setEditingItem(newItem);
  };
  
  const handleEditItem = (item: Language) => {
    setEditingItem({...item});
  };
  
  const handleDeleteItem = (id: string) => {
    onChange(languages.filter(item => item.id !== id));
  };
  
  const handleInputChange = (field: keyof Language, value: any) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        [field]: value
      });
    }
  };
  
  const handleSaveItem = () => {
    if (editingItem && editingItem.name.trim()) {
      const isNew = !languages.some(item => item.id === editingItem.id);
      const updatedLanguages = isNew 
        ? [...languages, editingItem]
        : languages.map(item => item.id === editingItem.id ? editingItem : item);
      
      onChange(updatedLanguages);
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
          <h2 className="text-xl font-semibold">Languages</h2>
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
              <label className="block text-sm font-medium mb-1">Language</label>
              <input
                type="text"
                value={editingItem.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="E.g. English, Spanish, French"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Proficiency Level</label>
              <select
                value={editingItem.proficiency}
                onChange={(e) => handleInputChange('proficiency', e.target.value as any)}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                {proficiencyLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSaveItem}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {languages.length > 0 ? (
              <div className="space-y-2">
                {languages.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground ml-2">•</span>
                      <span className="text-muted-foreground ml-2">{item.proficiency}</span>
                    </div>
                    
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                Add languages you speak to better connect with international clients
              </p>
            )}
            
            {isEditing && (
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Language
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LanguagesSection;
