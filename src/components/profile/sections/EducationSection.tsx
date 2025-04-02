
import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Edit2, Plus, Trash2 } from 'lucide-react';

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  from: string;
  to: string;
  current: boolean;
  description: string;
}

interface EducationSectionProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({ education = [], onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Education | null>(null);
  
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    setEditingItem(null);
  };
  
  const handleAddNew = () => {
    const newItem: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      from: '',
      to: '',
      current: false,
      description: ''
    };
    setEditingItem(newItem);
  };
  
  const handleEditItem = (item: Education) => {
    setEditingItem({...item});
  };
  
  const handleDeleteItem = (id: string) => {
    onChange(education.filter(item => item.id !== id));
  };
  
  const handleInputChange = (field: keyof Education, value: any) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        [field]: value
      });
    }
  };
  
  const handleSaveItem = () => {
    if (editingItem) {
      const isNew = !education.some(item => item.id === editingItem.id);
      const updatedEducation = isNew 
        ? [...education, editingItem]
        : education.map(item => item.id === editingItem.id ? editingItem : item);
      
      onChange(updatedEducation);
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
          <h2 className="text-xl font-semibold">Education</h2>
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
              <label className="block text-sm font-medium mb-1">Institution</label>
              <input
                type="text"
                value={editingItem.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="University, College or School name"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Degree</label>
                <input
                  type="text"
                  value={editingItem.degree}
                  onChange={(e) => handleInputChange('degree', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="Bachelor's, Master's, PhD, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Field of Study</label>
                <input
                  type="text"
                  value={editingItem.fieldOfStudy}
                  onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="Computer Science, Engineering, etc."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">From Year</label>
                <input
                  type="text"
                  value={editingItem.from}
                  onChange={(e) => handleInputChange('from', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="2010"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">To Year</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingItem.to}
                    onChange={(e) => handleInputChange('to', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md"
                    placeholder="2014"
                    disabled={editingItem.current}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editingItem.current}
                      onChange={(e) => handleInputChange('current', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Current
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={editingItem.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
                rows={3}
                placeholder="Describe your achievements, activities, etc."
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSaveItem}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {education.length > 0 ? (
              <div className="space-y-4">
                {education.map((item) => (
                  <div key={item.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{item.institution}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.degree} {item.fieldOfStudy && `in ${item.fieldOfStudy}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.from} - {item.current ? 'Present' : item.to}
                        </p>
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
                    
                    {item.description && (
                      <p className="mt-2 text-sm">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                Add your educational background to enhance your profile
              </p>
            )}
            
            {isEditing && (
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EducationSection;
