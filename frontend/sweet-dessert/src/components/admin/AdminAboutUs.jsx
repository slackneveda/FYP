import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AuroraText } from '@/components/ui/aurora-text';
import { Plus, Edit, Trash2, Save, X, Users, Award, Heart, ChefHat } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

const AdminAboutUs = () => {
  const [aboutPage, setAboutPage] = useState(null);
  const [values, setValues] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(false);
  const [editingValue, setEditingValue] = useState(null);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [pageFormData, setPageFormData] = useState({});
  const [valueFormData, setValueFormData] = useState({});
  const [teamFormData, setTeamFormData] = useState({});

  // Icon mapping for display
  const iconMap = {
    Heart: Heart,
    Award: Award,
    Users: Users,
    ChefHat: ChefHat
  };

  const colorOptions = [
    { value: 'from-red-500/20 to-pink-500/20', label: 'Red to Pink' },
    { value: 'from-amber-500/20 to-yellow-500/20', label: 'Amber to Yellow' },
    { value: 'from-blue-500/20 to-indigo-500/20', label: 'Blue to Indigo' },
    { value: 'from-emerald-500/20 to-teal-500/20', label: 'Emerald to Teal' },
    { value: 'from-purple-500/20 to-violet-500/20', label: 'Purple to Violet' },
    { value: 'from-orange-500/20 to-red-500/20', label: 'Orange to Red' }
  ];

  const iconOptions = ['Heart', 'Award', 'Users', 'ChefHat'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch active About Us page
      const pageResponse = await api.get('/cms/about-us/active/');
      if (pageResponse.data) {
        setAboutPage(pageResponse.data);
        setPageFormData(pageResponse.data);
        setValues(pageResponse.data.values || []);
        setTeamMembers(pageResponse.data.team_members || []);
      }
    } catch (error) {
      console.error('Error fetching About Us data:', error);
      toast.error('Failed to load About Us data');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePage = async () => {
    try {
      if (aboutPage) {
        await api.put(`/cms/about-us/${aboutPage.id}/`, pageFormData);
        toast.success('About Us page updated successfully');
      } else {
        const response = await api.post('/cms/about-us/', pageFormData);
        setAboutPage(response.data);
        toast.success('About Us page created successfully');
      }
      setEditingPage(false);
      fetchData();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
    }
  };

  const handleSaveValue = async () => {
    try {
      const formData = { ...valueFormData, about_page: aboutPage.id };
      
      if (editingValue && editingValue.id) {
        await api.put(`/cms/about-us-values/${editingValue.id}/`, formData);
        toast.success('Value updated successfully');
      } else {
        await api.post('/cms/about-us-values/', formData);
        toast.success('Value created successfully');
      }
      
      setEditingValue(null);
      setValueFormData({});
      fetchData();
    } catch (error) {
      console.error('Error saving value:', error);
      toast.error('Failed to save value');
    }
  };

  const handleSaveTeamMember = async () => {
    try {
      const formData = { ...teamFormData, about_page: aboutPage.id };
      
      if (editingTeamMember && editingTeamMember.id) {
        await api.put(`/cms/about-us-team/${editingTeamMember.id}/`, formData);
        toast.success('Team member updated successfully');
      } else {
        await api.post('/cms/about-us-team/', formData);
        toast.success('Team member created successfully');
      }
      
      setEditingTeamMember(null);
      setTeamFormData({});
      fetchData();
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error('Failed to save team member');
    }
  };

  const handleDeleteValue = async (valueId) => {
    if (window.confirm('Are you sure you want to delete this value?')) {
      try {
        await api.delete(`/cms/about-us-values/${valueId}/`);
        toast.success('Value deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting value:', error);
        toast.error('Failed to delete value');
      }
    }
  };

  const handleDeleteTeamMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await api.delete(`/cms/about-us-team/${memberId}/`);
        toast.success('Team member deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting team member:', error);
        toast.error('Failed to delete team member');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            <AuroraText>About Us Page</AuroraText>
          </h1>
          <p className="text-muted-foreground">Manage your About Us page content</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          CMS Management
        </Badge>
      </div>

      {/* Page Content Section */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Page Content</CardTitle>
          <Button
            variant={editingPage ? "outline" : "default"}
            size="sm"
            onClick={() => {
              setEditingPage(!editingPage);
              if (!editingPage) {
                setPageFormData(aboutPage || {});
              }
            }}
          >
            {editingPage ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {editingPage ? 'Cancel' : 'Edit'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingPage ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hero_title">Hero Title</Label>
                  <Input
                    id="hero_title"
                    value={pageFormData.hero_title || ''}
                    onChange={(e) => setPageFormData({ ...pageFormData, hero_title: e.target.value })}
                    placeholder="About Sweet Dessert"
                  />
                </div>
                <div>
                  <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                  <Textarea
                    id="hero_subtitle"
                    value={pageFormData.hero_subtitle || ''}
                    onChange={(e) => setPageFormData({ ...pageFormData, hero_subtitle: e.target.value })}
                    placeholder="We create exquisite desserts..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="mission_title">Mission Title</Label>
                  <Input
                    id="mission_title"
                    value={pageFormData.mission_title || ''}
                    onChange={(e) => setPageFormData({ ...pageFormData, mission_title: e.target.value })}
                    placeholder="Our Mission"
                  />
                </div>
                <div>
                  <Label htmlFor="mission_text">Mission Text</Label>
                  <Textarea
                    id="mission_text"
                    value={pageFormData.mission_text || ''}
                    onChange={(e) => setPageFormData({ ...pageFormData, mission_text: e.target.value })}
                    placeholder="To transform life's precious moments..."
                    rows={4}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="store_title">Store Title</Label>
                  <Input
                    id="store_title"
                    value={pageFormData.store_title || ''}
                    onChange={(e) => setPageFormData({ ...pageFormData, store_title: e.target.value })}
                    placeholder="Visit Our Store"
                  />
                </div>
                <div>
                  <Label htmlFor="store_address">Store Address</Label>
                  <Input
                    id="store_address"
                    value={pageFormData.store_address || ''}
                    onChange={(e) => setPageFormData({ ...pageFormData, store_address: e.target.value })}
                    placeholder="123 Sweet Street, Dessert City, DC 12345"
                  />
                </div>
                <div>
                  <Label htmlFor="store_hours">Store Hours</Label>
                  <Input
                    id="store_hours"
                    value={pageFormData.store_hours || ''}
                    onChange={(e) => setPageFormData({ ...pageFormData, store_hours: e.target.value })}
                    placeholder="Mon-Thu: 7AM-9PM | Fri-Sun: 7AM-10PM"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSavePage} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{aboutPage?.hero_title}</h3>
                <p className="text-muted-foreground">{aboutPage?.hero_subtitle}</p>
              </div>
              <div>
                <h4 className="font-medium">{aboutPage?.mission_title}</h4>
                <p className="text-sm text-muted-foreground">{aboutPage?.mission_text}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Values Section */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Values</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setEditingValue({ new: true });
              setValueFormData({ order: values.length + 1 });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Value
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((value) => (
              <Card key={value.id} className="border border-border/50">
                <CardContent className="p-4">
                  {editingValue && editingValue.id === value.id ? (
                    <div className="space-y-3">
                      <Input
                        value={valueFormData.title || ''}
                        onChange={(e) => setValueFormData({ ...valueFormData, title: e.target.value })}
                        placeholder="Title"
                      />
                      <Textarea
                        value={valueFormData.description || ''}
                        onChange={(e) => setValueFormData({ ...valueFormData, description: e.target.value })}
                        placeholder="Description"
                        rows={3}
                      />
                      <select
                        value={valueFormData.icon || ''}
                        onChange={(e) => setValueFormData({ ...valueFormData, icon: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Icon</option>
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveValue}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingValue(null)}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {React.createElement(iconMap[value.icon] || Heart, { className: "h-4 w-4 text-primary" })}
                          <h4 className="font-medium text-sm">{value.title}</h4>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingValue(value);
                              setValueFormData(value);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteValue(value.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{value.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Value Form */}
            {editingValue && editingValue.new && (
              <Card className="border border-border/50 border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Input
                      value={valueFormData.title || ''}
                      onChange={(e) => setValueFormData({ ...valueFormData, title: e.target.value })}
                      placeholder="Value Title"
                    />
                    <Textarea
                      value={valueFormData.description || ''}
                      onChange={(e) => setValueFormData({ ...valueFormData, description: e.target.value })}
                      placeholder="Value Description"
                      rows={3}
                    />
                    <select
                      value={valueFormData.icon || ''}
                      onChange={(e) => setValueFormData({ ...valueFormData, icon: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select Icon</option>
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                    <select
                      value={valueFormData.color_gradient || ''}
                      onChange={(e) => setValueFormData({ ...valueFormData, color_gradient: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select Color</option>
                      {colorOptions.map(color => (
                        <option key={color.value} value={color.value}>{color.label}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveValue}>
                        <Save className="h-3 w-3 mr-1" />
                        Add Value
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingValue(null)}>
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Members Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Members</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setEditingTeamMember({ new: true });
              setTeamFormData({ order: teamMembers.length + 1 });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <Card key={member.id} className="border border-border/50">
                <CardContent className="p-4">
                  {editingTeamMember && editingTeamMember.id === member.id ? (
                    <div className="space-y-3">
                      <Input
                        value={teamFormData.name || ''}
                        onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                        placeholder="Name"
                      />
                      <Input
                        value={teamFormData.role || ''}
                        onChange={(e) => setTeamFormData({ ...teamFormData, role: e.target.value })}
                        placeholder="Role"
                      />
                      <Textarea
                        value={teamFormData.description || ''}
                        onChange={(e) => setTeamFormData({ ...teamFormData, description: e.target.value })}
                        placeholder="Description"
                        rows={3}
                      />
                      <Input
                        value={teamFormData.image_emoji || ''}
                        onChange={(e) => setTeamFormData({ ...teamFormData, image_emoji: e.target.value })}
                        placeholder="Emoji (e.g., 👨‍🍳)"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveTeamMember}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingTeamMember(null)}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-center">
                          <div className="text-2xl mb-1">{member.image_emoji}</div>
                          <h4 className="font-medium text-sm">{member.name}</h4>
                          <Badge variant="outline" className="text-xs">{member.role}</Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingTeamMember(member);
                              setTeamFormData(member);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTeamMember(member.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">{member.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Team Member Form */}
            {editingTeamMember && editingTeamMember.new && (
              <Card className="border border-border/50 border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Input
                      value={teamFormData.name || ''}
                      onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                      placeholder="Member Name"
                    />
                    <Input
                      value={teamFormData.role || ''}
                      onChange={(e) => setTeamFormData({ ...teamFormData, role: e.target.value })}
                      placeholder="Role/Position"
                    />
                    <Textarea
                      value={teamFormData.description || ''}
                      onChange={(e) => setTeamFormData({ ...teamFormData, description: e.target.value })}
                      placeholder="Member Description"
                      rows={3}
                    />
                    <Input
                      value={teamFormData.image_emoji || ''}
                      onChange={(e) => setTeamFormData({ ...teamFormData, image_emoji: e.target.value })}
                      placeholder="Emoji (e.g., 👨‍🍳)"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveTeamMember}>
                        <Save className="h-3 w-3 mr-1" />
                        Add Member
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingTeamMember(null)}>
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAboutUs;