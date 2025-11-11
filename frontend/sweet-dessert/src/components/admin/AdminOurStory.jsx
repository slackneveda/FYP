import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AuroraText } from '@/components/ui/aurora-text';
import { Plus, Edit, Trash2, Save, X, Heart, Award, Users, Star, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

const AdminOurStory = () => {
  const [storyPage, setStoryPage] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [impactMetrics, setImpactMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingMetric, setEditingMetric] = useState(null);
  const [pageFormData, setPageFormData] = useState({});
  const [eventFormData, setEventFormData] = useState({});
  const [metricFormData, setMetricFormData] = useState({});

  // Icon mapping for display
  const iconMap = {
    Heart: Heart,
    Award: Award,
    Users: Users,
    Star: Star,
    Sparkles: Sparkles
  };

  const iconOptions = ['Heart', 'Award', 'Users', 'Star', 'Sparkles'];

  const colorOptions = [
    { value: 'from-pink-500/20 to-red-500/20', label: 'Pink to Red' },
    { value: 'from-yellow-500/20 to-amber-500/20', label: 'Yellow to Amber' },
    { value: 'from-blue-500/20 to-indigo-500/20', label: 'Blue to Indigo' },
    { value: 'from-emerald-500/20 to-teal-500/20', label: 'Emerald to Teal' },
    { value: 'from-purple-500/20 to-pink-500/20', label: 'Purple to Pink' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch active Our Story page
      const pageResponse = await api.get('/cms/our-story/active/');
      if (pageResponse.data) {
        setStoryPage(pageResponse.data);
        setPageFormData(pageResponse.data);
        setTimelineEvents(pageResponse.data.timeline_events || []);
        setImpactMetrics(pageResponse.data.impact_metrics || []);
      }
    } catch (error) {
      console.error('Error fetching Our Story data:', error);
      toast.error('Failed to load Our Story data');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePage = async () => {
    try {
      if (storyPage) {
        await api.put(`/cms/our-story/${storyPage.id}/`, pageFormData);
        toast.success('Our Story page updated successfully');
      } else {
        const response = await api.post('/cms/our-story/', pageFormData);
        setStoryPage(response.data);
        toast.success('Our Story page created successfully');
      }
      setEditingPage(false);
      fetchData();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
    }
  };

  const handleSaveEvent = async () => {
    try {
      const formData = { ...eventFormData, story_page: storyPage.id };
      
      if (editingEvent && editingEvent.id) {
        await api.put(`/cms/story-timeline/${editingEvent.id}/`, formData);
        toast.success('Timeline event updated successfully');
      } else {
        await api.post('/cms/story-timeline/', formData);
        toast.success('Timeline event created successfully');
      }
      
      setEditingEvent(null);
      setEventFormData({});
      fetchData();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleSaveMetric = async () => {
    try {
      const formData = { ...metricFormData, story_page: storyPage.id };
      
      if (editingMetric && editingMetric.id) {
        await api.put(`/cms/story-impact/${editingMetric.id}/`, formData);
        toast.success('Impact metric updated successfully');
      } else {
        await api.post('/cms/story-impact/', formData);
        toast.success('Impact metric created successfully');
      }
      
      setEditingMetric(null);
      setMetricFormData({});
      fetchData();
    } catch (error) {
      console.error('Error saving metric:', error);
      toast.error('Failed to save metric');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this timeline event?')) {
      try {
        await api.delete(`/cms/story-timeline/${eventId}/`);
        toast.success('Timeline event deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const handleDeleteMetric = async (metricId) => {
    if (window.confirm('Are you sure you want to delete this impact metric?')) {
      try {
        await api.delete(`/cms/story-impact/${metricId}/`);
        toast.success('Impact metric deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting metric:', error);
        toast.error('Failed to delete metric');
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
            <AuroraText>Our Story Page</AuroraText>
          </h1>
          <p className="text-muted-foreground">Manage your Our Story page content</p>
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
                setPageFormData(storyPage || {});
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
                    placeholder="Our Sweet Journey"
                  />
                </div>
                <div>
                  <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                  <Textarea
                    id="hero_subtitle"
                    value={pageFormData.hero_subtitle || ''}
                    onChange={(e) => setPageFormData({ ...pageFormData, hero_subtitle: e.target.value })}
                    placeholder="From a passionate dream to your favorite dessert destination"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="founder_name">Founder Name</Label>
                  <Input
                    id="founder_name"
                    value={pageFormData.founder_name || ''}
                    onChange={(e) => setPageFormData({ ...pageFormData, founder_name: e.target.value })}
                    placeholder="Noor Ahmed"
                  />
                </div>
                <div>
                  <Label htmlFor="founder_title">Founder Title</Label>
                  <Input
                    id="founder_title"
                    value={pageFormData.founder_title || ''}
                    onChange={(e) => setPageFormData({ ...pageFormData, founder_title: e.target.value })}
                    placeholder="Founder & Head Pastry Chef"
                  />
                </div>
                <div>
                  <Label htmlFor="founder_quote">Founder Quote</Label>
                  <Textarea
                    id="founder_quote"
                    value={pageFormData.founder_quote || ''}
                    onChange={(e) => setPageFormData({ ...pageFormData, founder_quote: e.target.value })}
                    placeholder="Every dessert tells a story..."
                    rows={2}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="founder_description">Founder Description</Label>
                  <Textarea
                    id="founder_description"
                    value={pageFormData.founder_description || ''}
                    onChange={(e) => setPageFormData({ ...pageFormData, founder_description: e.target.value })}
                    placeholder="With over a decade of experience..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="vision_title">Vision Title</Label>
                  <Input
                    id="vision_title"
                    value={pageFormData.vision_title || ''}
                    onChange={(e) => setPageFormData({ ...pageFormData, vision_title: e.target.value })}
                    placeholder="Our Vision"
                  />
                </div>
                <div>
                  <Label htmlFor="vision_text">Vision Text</Label>
                  <Textarea
                    id="vision_text"
                    value={pageFormData.vision_text || ''}
                    onChange={(e) => setPageFormData({ ...pageFormData, vision_text: e.target.value })}
                    placeholder="To become the world's most beloved dessert destination..."
                    rows={4}
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
                <h3 className="font-semibold text-lg">{storyPage?.hero_title}</h3>
                <p className="text-muted-foreground">{storyPage?.hero_subtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Founder: {storyPage?.founder_name}</h4>
                  <p className="text-sm text-muted-foreground">{storyPage?.founder_title}</p>
                  <p className="text-sm italic mt-2">"{storyPage?.founder_quote}"</p>
                </div>
                <div>
                  <h4 className="font-medium">{storyPage?.vision_title}</h4>
                  <p className="text-sm text-muted-foreground">{storyPage?.vision_text}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Events Section */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Timeline Events</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setEditingEvent({ new: true });
              setEventFormData({ order: timelineEvents.length + 1 });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timelineEvents.map((event) => (
              <Card key={event.id} className="border border-border/50">
                <CardContent className="p-4">
                  {editingEvent && editingEvent.id === event.id ? (
                    <div className="space-y-3">
                      <Input
                        value={eventFormData.year || ''}
                        onChange={(e) => setEventFormData({ ...eventFormData, year: e.target.value })}
                        placeholder="Year (e.g., 2016)"
                      />
                      <Input
                        value={eventFormData.title || ''}
                        onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                        placeholder="Event Title"
                      />
                      <Textarea
                        value={eventFormData.description || ''}
                        onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                        placeholder="Event Description"
                        rows={3}
                      />
                      <select
                        value={eventFormData.icon || ''}
                        onChange={(e) => setEventFormData({ ...eventFormData, icon: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Icon</option>
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEvent}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingEvent(null)}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{event.year}</Badge>
                          {React.createElement(iconMap[event.icon] || Heart, { className: "h-4 w-4 text-primary" })}
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingEvent(event);
                              setEventFormData(event);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Event Form */}
            {editingEvent && editingEvent.new && (
              <Card className="border border-border/50 border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Input
                      value={eventFormData.year || ''}
                      onChange={(e) => setEventFormData({ ...eventFormData, year: e.target.value })}
                      placeholder="Year (e.g., 2025)"
                    />
                    <Input
                      value={eventFormData.title || ''}
                      onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                      placeholder="Event Title"
                    />
                    <Textarea
                      value={eventFormData.description || ''}
                      onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                      placeholder="Event Description"
                      rows={3}
                    />
                    <select
                      value={eventFormData.icon || ''}
                      onChange={(e) => setEventFormData({ ...eventFormData, icon: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select Icon</option>
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                    <select
                      value={eventFormData.color_gradient || ''}
                      onChange={(e) => setEventFormData({ ...eventFormData, color_gradient: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select Color</option>
                      {colorOptions.map(color => (
                        <option key={color.value} value={color.value}>{color.label}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEvent}>
                        <Save className="h-3 w-3 mr-1" />
                        Add Event
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingEvent(null)}>
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

      {/* Impact Metrics Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Impact Metrics</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setEditingMetric({ new: true });
              setMetricFormData({ order: impactMetrics.length + 1 });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Metric
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {impactMetrics.map((metric) => (
              <Card key={metric.id} className="border border-border/50">
                <CardContent className="p-4 text-center">
                  {editingMetric && editingMetric.id === metric.id ? (
                    <div className="space-y-3">
                      <Input
                        value={metricFormData.number || ''}
                        onChange={(e) => setMetricFormData({ ...metricFormData, number: e.target.value })}
                        placeholder="Number (e.g., 50,000+)"
                      />
                      <Input
                        value={metricFormData.label || ''}
                        onChange={(e) => setMetricFormData({ ...metricFormData, label: e.target.value })}
                        placeholder="Label (e.g., Happy Customers)"
                      />
                      <select
                        value={metricFormData.icon || ''}
                        onChange={(e) => setMetricFormData({ ...metricFormData, icon: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Icon</option>
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveMetric}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingMetric(null)}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          {React.createElement(iconMap[metric.icon] || Users, { className: "h-6 w-6 text-primary mx-auto mb-2" })}
                          <div className="text-2xl font-bold text-foreground mb-1">{metric.number}</div>
                          <p className="text-sm text-muted-foreground">{metric.label}</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingMetric(metric);
                              setMetricFormData(metric);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMetric(metric.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Metric Form */}
            {editingMetric && editingMetric.new && (
              <Card className="border border-border/50 border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Input
                      value={metricFormData.number || ''}
                      onChange={(e) => setMetricFormData({ ...metricFormData, number: e.target.value })}
                      placeholder="Number (e.g., 100K+)"
                    />
                    <Input
                      value={metricFormData.label || ''}
                      onChange={(e) => setMetricFormData({ ...metricFormData, label: e.target.value })}
                      placeholder="Label (e.g., Satisfied Customers)"
                    />
                    <select
                      value={metricFormData.icon || ''}
                      onChange={(e) => setMetricFormData({ ...metricFormData, icon: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select Icon</option>
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveMetric}>
                        <Save className="h-3 w-3 mr-1" />
                        Add Metric
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingMetric(null)}>
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

export default AdminOurStory;