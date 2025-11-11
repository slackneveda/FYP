import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AuroraText } from '@/components/ui/aurora-text';
import { 
  Plus, Edit, Trash2, Save, X, Package, CreditCard, Truck, Heart, 
  ChefHat, Clock, MapPin, Phone, Mail, Star, Users, Award, Coffee, 
  Cake, Sparkles, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

const AdminFAQ = () => {
  const [faqPage, setFaqPage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [pageFormData, setPageFormData] = useState({});
  const [categoryFormData, setCategoryFormData] = useState({});
  const [itemFormData, setItemFormData] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  // Icon mapping for display
  const iconMap = {
    Package: Package,
    CreditCard: CreditCard,
    Truck: Truck,
    Heart: Heart,
    ChefHat: ChefHat,
    Clock: Clock,
    MapPin: MapPin,
    Phone: Phone,
    Mail: Mail,
    Star: Star,
    Users: Users,
    Award: Award,
    Coffee: Coffee,
    Cake: Cake,
    Sparkles: Sparkles,
    HelpCircle: HelpCircle
  };

  const iconOptions = [
    'Package', 'CreditCard', 'Truck', 'Heart', 'ChefHat', 'Clock',
    'MapPin', 'Phone', 'Mail', 'Star', 'Users', 'Award', 'Coffee',
    'Cake', 'Sparkles', 'HelpCircle'
  ];

  const colorOptions = [
    { value: 'orange', label: 'Orange' },
    { value: 'pink', label: 'Pink' },
    { value: 'purple', label: 'Purple' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'red', label: 'Red' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'indigo', label: 'Indigo' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching FAQ data...');
      
      // Fetch active FAQ page
      const pageResponse = await api.getFAQPage();
      console.log('FAQ API Response:', pageResponse);
      
      if (pageResponse.data || pageResponse) {
        const data = pageResponse.data || pageResponse;
        console.log('FAQ Data:', data);
        setFaqPage(data);
        setPageFormData(data);
        setCategories(data.categories || []);
        
        // Initialize expanded state for categories
        const expanded = {};
        (data.categories || []).forEach(cat => {
          expanded[cat.id] = false;
        });
        setExpandedCategories(expanded);
      }
    } catch (error) {
      console.error('Error fetching FAQ data:', error);
      console.error('Error details:', error.message);
      
      if (error.message.includes('404')) {
        // No FAQ page exists yet, set up for creation
        console.log('No FAQ page found, setting up for creation');
        setFaqPage(null);
        setPageFormData({
          title: 'Frequently Asked Questions',
          subtitle: 'Find answers to commonly asked questions about our desserts, ordering, and services.',
          hero_background_color: 'from-orange-50 to-pink-50'
        });
      } else {
        toast.error(`Failed to load FAQ data: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSavePage = async () => {
    try {
      if (faqPage) {
        await api.updateFAQPage(faqPage.id, pageFormData);
        toast.success('FAQ page updated successfully');
      } else {
        const response = await api.createFAQPage(pageFormData);
        setFaqPage(response.data || response);
        toast.success('FAQ page created successfully');
      }
      setEditingPage(false);
      fetchData();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error(`Failed to save page: ${error.message}`);
    }
  };

  const handleSaveCategory = async () => {
    try {
      const formData = { ...categoryFormData, faq_page: faqPage.id };
      
      if (editingCategory && editingCategory.id) {
        await api.updateFAQCategory(editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await api.createFAQCategory(formData);
        toast.success('Category created successfully');
      }
      
      setEditingCategory(null);
      setCategoryFormData({});
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleSaveItem = async () => {
    try {
      // Validation
      if (!itemFormData.question || !itemFormData.question.trim()) {
        toast.error('Please enter a question');
        return;
      }
      
      if (!itemFormData.answer || !itemFormData.answer.trim()) {
        toast.error('Please enter an answer');
        return;
      }
      
      if (!itemFormData.category) {
        toast.error('Category is required');
        return;
      }
      
      console.log('Saving FAQ item with data:', itemFormData);
      
      if (editingItem && editingItem.id) {
        const response = await api.updateFAQItem(editingItem.id, itemFormData);
        console.log('FAQ item updated:', response);
        toast.success('FAQ item updated successfully');
      } else {
        const response = await api.createFAQItem(itemFormData);
        console.log('FAQ item created:', response);
        toast.success('FAQ item created successfully');
      }
      
      setEditingItem(null);
      setItemFormData({});
      await fetchData();
    } catch (error) {
      console.error('Error saving FAQ item:', error);
      console.error('Error details:', error.message);
      toast.error(`Failed to save FAQ item: ${error.message}`);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all FAQ items in this category.')) {
      return;
    }

    try {
      await api.deleteFAQCategory(categoryId);
      toast.success('Category deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this FAQ item?')) {
      return;
    }

    try {
      await api.deleteFAQItem(itemId);
      toast.success('FAQ item deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting FAQ item:', error);
      toast.error('Failed to delete FAQ item');
    }
  };

  const startEditingCategory = (category = null) => {
    setEditingCategory(category);
    setCategoryFormData(category ? { ...category } : {
      name: '',
      description: '',
      icon: 'Package',
      color: 'orange',
      order: 0,
      is_active: true
    });
  };

  const startEditingItem = (item = null, categoryId = null) => {
    console.log('Starting to edit item:', item, 'Category ID:', categoryId);
    setEditingItem(item || { category: categoryId });
    setItemFormData(item ? { ...item } : {
      category: categoryId,
      question: '',
      answer: '',
      order: 0,
      is_active: true
    });
    console.log('Item form data initialized:', item ? { ...item } : {
      category: categoryId,
      question: '',
      answer: '',
      order: 0,
      is_active: true
    });
  };

  const toggleCategoryExpanded = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading FAQ Data...</h2>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            <AuroraText>FAQ Management</AuroraText>
          </h1>
          <p className="text-muted-foreground mt-2">Manage your FAQ page content, categories, and questions</p>
        </div>
      </div>

      {/* FAQ Page Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              FAQ Page Settings
            </CardTitle>
            <Button
              variant={editingPage ? "destructive" : "default"}
              size="sm"
              onClick={() => {
                if (editingPage) {
                  setEditingPage(false);
                  setPageFormData(faqPage || {});
                } else {
                  setEditingPage(true);
                }
              }}
            >
              {editingPage ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              {editingPage ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingPage ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={pageFormData.title || ''}
                  onChange={(e) => setPageFormData({ ...pageFormData, title: e.target.value })}
                  placeholder="FAQ page title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={pageFormData.subtitle || ''}
                  onChange={(e) => setPageFormData({ ...pageFormData, subtitle: e.target.value })}
                  placeholder="FAQ page subtitle"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_background_color">Background Color</Label>
                <Input
                  id="hero_background_color"
                  value={pageFormData.hero_background_color || ''}
                  onChange={(e) => setPageFormData({ ...pageFormData, hero_background_color: e.target.value })}
                  placeholder="e.g., from-orange-50 to-pink-50"
                />
              </div>
              <Button onClick={handleSavePage} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Page Settings
              </Button>
            </>
          ) : (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{faqPage?.title || 'No FAQ page created'}</h3>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ Categories */}
      {faqPage && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>FAQ Categories ({categories.length})</CardTitle>
              <Button
                onClick={() => startEditingCategory()}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingCategory && (
              <Card className="mb-6 border-2 border-dashed border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {editingCategory.id ? 'Edit Category' : 'New Category'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">Category Name</Label>
                      <Input
                        id="cat-name"
                        value={categoryFormData.name || ''}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                        placeholder="e.g., Ordering & Payment"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat-icon">Icon</Label>
                      <Select
                        id="cat-icon"
                        value={categoryFormData.icon || 'Package'}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                      >
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat-color">Color</Label>
                      <Select
                        id="cat-color"
                        value={categoryFormData.color || 'orange'}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                      >
                        {colorOptions.map(color => (
                          <option key={color.value} value={color.value}>
                            {color.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat-order">Order</Label>
                      <Input
                        id="cat-order"
                        type="number"
                        value={categoryFormData.order || 0}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, order: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-description">Description</Label>
                    <Textarea
                      id="cat-description"
                      value={categoryFormData.description || ''}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                      placeholder="Category description (optional)"
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cat-active"
                      checked={categoryFormData.is_active || false}
                      onCheckedChange={(checked) => setCategoryFormData({ ...categoryFormData, is_active: checked })}
                    />
                    <Label htmlFor="cat-active">Active</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveCategory} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save Category
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryFormData({});
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {categories.map((category) => {
                const IconComponent = iconMap[category.icon] || Package;
                const isExpanded = expandedCategories[category.id];
                
                return (
                  <Card key={category.id} className="border-l-4" style={{ borderLeftColor: `var(--${category.color}-500)` }}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${category.color}-100`}>
                            <IconComponent className={`w-5 h-5 text-${category.color}-600`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{category.name}</h4>
                            <p className="text-sm text-muted-foreground">{category.faq_items?.length || 0} questions</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={category.is_active ? "default" : "secondary"}>
                              {category.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">Order: {category.order}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCategoryExpanded(category.id)}
                          >
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">FAQ Items</h5>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditingItem(null, category.id)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Question
                            </Button>
                          </div>

                          {editingItem && itemFormData.category === category.id && (
                            <Card className="border-2 border-dashed border-gray-200">
                              <CardContent className="pt-4 space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="item-question">Question</Label>
                                  <Input
                                    id="item-question"
                                    value={itemFormData.question || ''}
                                    onChange={(e) => setItemFormData({ ...itemFormData, question: e.target.value })}
                                    placeholder="Enter the FAQ question"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="item-answer">Answer</Label>
                                  <Textarea
                                    id="item-answer"
                                    value={itemFormData.answer || ''}
                                    onChange={(e) => setItemFormData({ ...itemFormData, answer: e.target.value })}
                                    placeholder="Enter the answer"
                                    rows={4}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="item-order">Order</Label>
                                    <Input
                                      id="item-order"
                                      type="number"
                                      value={itemFormData.order || 0}
                                      onChange={(e) => setItemFormData({ ...itemFormData, order: parseInt(e.target.value) || 0 })}
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2 mt-6">
                                    <Switch
                                      id="item-active"
                                      checked={itemFormData.is_active || false}
                                      onCheckedChange={(checked) => setItemFormData({ ...itemFormData, is_active: checked })}
                                    />
                                    <Label htmlFor="item-active">Active</Label>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={handleSaveItem} className="flex-1">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save FAQ Item
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditingItem(null);
                                      setItemFormData({});
                                    }}
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          <div className="space-y-2">
                            {category.faq_items?.map((item) => (
                              <div key={item.id} className="p-4 border rounded-lg bg-card">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h6 className="font-medium text-foreground mb-2">{item.question}</h6>
                                    <p className="text-sm text-muted-foreground mb-2">{item.answer}</p>
                                    <div className="flex gap-2">
                                      <Badge variant={item.is_active ? "default" : "secondary"} className="text-xs">
                                        {item.is_active ? 'Active' : 'Inactive'}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        Order: {item.order}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 ml-4">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => startEditingItem(item)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteItem(item.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {(!category.faq_items || category.faq_items.length === 0) && (
                              <div className="text-center py-8 text-muted-foreground">
                                <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No FAQ items in this category yet.</p>
                                <p className="text-sm">Click "Add Question" to get started.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
              
              {categories.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No FAQ categories yet</h3>
                  <p className="mb-4">Create your first FAQ category to organize your questions.</p>
                  <Button onClick={() => startEditingCategory()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Category
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminFAQ;