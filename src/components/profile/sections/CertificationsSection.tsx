
import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Edit2, Plus, Trash2 } from 'lucide-react';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

interface CertificationsSectionProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({ certifications = [], onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Certification | null>(null);
  
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    setEditingItem(null);
  };
  
  const handleAddNew = () => {
    const newItem: Certification = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      issueDate: '',
      expirationDate: '',
      credentialId: '',
      credentialUrl: ''
    };
    setEditingItem(newItem);
  };
  
  const handleEditItem = (item: Certification) => {
    setEditingItem({...item});
  };
  
  const handleDeleteItem = (id: string) => {
    onChange(certifications.filter(item => item.id !== id));
  };
  
  const handleInputChange = (field: keyof Certification, value: any) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        [field]: value
      });
    }
  };
  
  const handleSaveItem = () => {
    if (editingItem) {
      const isNew = !certifications.some(item => item.id === editingItem.id);
      const updatedCertifications = isNew 
        ? [...certifications, editingItem]
        : certifications.map(item => item.id === editingItem.id ? editingItem : item);
      
      onChange(updatedCertifications);
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
          <h2 className="text-xl font-semibold">Certifications</h2>
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
              <label className="block text-sm font-medium mb-1">Certificate Name</label>
              <input
                type="text"
                value={editingItem.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="E.g. AWS Certified Solutions Architect"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Issuing Organization</label>
              <input
                type="text"
                value={editingItem.issuer}
                onChange={(e) => handleInputChange('issuer', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="E.g. Amazon Web Services"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Issue Date</label>
                <input
                  type="text"
                  value={editingItem.issueDate}
                  onChange={(e) => handleInputChange('issueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="Month Year (e.g. Jan 2022)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Expiration Date (Optional)</label>
                <input
                  type="text"
                  value={editingItem.expirationDate || ''}
                  onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="Month Year (e.g. Jan 2025)"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Credential ID (Optional)</label>
                <input
                  type="text"
                  value={editingItem.credentialId || ''}
                  onChange={(e) => handleInputChange('credentialId', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="E.g. ABC123XYZ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Credential URL (Optional)</label>
                <input
                  type="text"
                  value={editingItem.credentialUrl || ''}
                  onChange={(e) => handleInputChange('credentialUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="https://"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSaveItem}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {certifications.length > 0 ? (
              <div className="space-y-4">
                {certifications.map((item) => (
                  <div key={item.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.issuer} • Issued {item.issueDate}
                          {item.expirationDate && ` • Expires ${item.expirationDate}`}
                        </p>
                        {item.credentialId && (
                          <p className="text-sm text-muted-foreground">
                            Credential ID: {item.credentialId}
                          </p>
                        )}
                        {item.credentialUrl && (
                          <a 
                            href={item.credentialUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Credential
                          </a>
                        )}
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                Add your certifications to demonstrate your expertise and credentials
              </p>
            )}
            
            {isEditing && (
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Certification
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificationsSection;
