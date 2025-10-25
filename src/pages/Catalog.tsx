import { useState } from 'react';
import { Search, Filter, Plus, Share2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

const categories = ['All', 'Silk', 'Cotton', 'Partywear', 'Designer', 'Handloom'];

const Catalog = () => {
  const navigate = useNavigate();
  const { sarees } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredSarees = sarees.filter(saree => {
    const matchesSearch = saree.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || saree.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleWhatsAppShare = (saree: typeof sarees[0]) => {
    const message = `🥻 *${saree.name}*\n\n💰 Price: ₹${saree.price.toLocaleString()}\n📦 Stock: ${saree.stock} pieces\n📝 ${saree.description}\n\n*Ama Sarees* - Elegant Textiles at Home`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (stock <= 2) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-elegant text-3xl font-bold text-primary">Saree Catalog</h1>
          <p className="text-muted-foreground">Manage your beautiful collection</p>
        </div>
        <Button onClick={() => navigate('/add-saree')} className="gradient-warm shadow-soft">
          <Plus size={16} className="mr-2" />
          Add Saree
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sarees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-muted-foreground">
        Showing {filteredSarees.length} of {sarees.length} sarees
      </p>

      {/* Saree Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSarees.map((saree) => {
          const stockStatus = getStockStatus(saree.stock);
          return (
            <Card key={saree.id} className="overflow-hidden shadow-soft hover:shadow-warm transition-all duration-200 hover:scale-105">
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={saree.image}
                  alt={saree.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{saree.name}</h3>
                    <p className="text-sm text-muted-foreground">{saree.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{saree.category}</Badge>
                    <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xl text-primary">
                      ₹{saree.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Stock: {saree.stock}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye size={14} className="mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleWhatsAppShare(saree)}
                    >
                      <Share2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSarees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No sarees found matching your criteria.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Catalog;