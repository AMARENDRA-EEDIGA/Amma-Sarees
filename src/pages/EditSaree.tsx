import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

const EditSaree = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { sarees, updateSaree } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    notes: '',
    image: '',
  });

  const categories = ['Silk', 'Cotton', 'Partywear', 'Designer', 'Handloom'];

  useEffect(() => {
    const saree = sarees.find(s => s.id === id);
    if (saree) {
      setFormData({
        name: saree.name,
        category: saree.category,
        price: saree.price.toString(),
        stock: saree.stock.toString(),
        notes: saree.notes,
        image: saree.image || '',
      });
    } else {
      toast({
        title: "Error",
        description: "Saree not found.",
        variant: "destructive"
      });
      navigate('/catalog');
    }
  }, [id, sarees, navigate, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.price || !formData.stock) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateSaree(id!, {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        notes: formData.notes,
        image: formData.image || undefined
      });

      toast({
        title: "Success!",
        description: `${formData.name} has been updated.`,
        className: "bg-green-50 border-green-200 text-green-800",
      });

      navigate('/catalog');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update saree.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="font-elegant text-3xl font-bold text-primary">Edit Saree</h1>
          <p className="text-muted-foreground">Update saree details</p>
        </div>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Saree Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image">Saree Image URL</Label>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/saree-image.jpg"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Saree Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Banarasi Silk Saree"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 12500"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional details about the saree"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                <Save size={16} className="mr-2" />
                Update Saree
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditSaree;