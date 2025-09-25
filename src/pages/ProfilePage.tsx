import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { CalendarDays, Mail, MapPin, User, Edit, Save, X } from 'lucide-react'
import Navigation from '@/components/Navigation'

const ProfilePage = () => {
  const { user, userProfile, updateProfile, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    display_name: userProfile?.display_name || '',
    username: userProfile?.username || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setIsEditing(false)
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      })
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = () => {
    setFormData({
      display_name: userProfile?.display_name || '',
      username: userProfile?.username || '',
      bio: userProfile?.bio || '',
      location: userProfile?.location || '',
    })
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Please sign in to view your profile.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navigation />
      
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
              <p className="text-gray-300">
                Manage your account settings and preferences
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Summary Card */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage 
                          src={userProfile.avatar_url || undefined} 
                          alt={userProfile.display_name || 'User'} 
                        />
                        <AvatarFallback className="text-lg">
                          {getInitials(userProfile.display_name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-xl">
                      {userProfile.display_name || 'User'}
                    </CardTitle>
                    <CardDescription className="flex items-center justify-center gap-1">
                      @{userProfile.username}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {userProfile.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {userProfile.email}
                      </div>
                    )}
                    
                    {userProfile.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {userProfile.location}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarDays className="h-4 w-4" />
                      Joined {formatDate(userProfile.created_at)}
                    </div>

                    <div className="pt-2">
                      <Badge variant="secondary" className="capitalize">
                        {userProfile.provider || 'email'} Account
                      </Badge>
                    </div>

                    {userProfile.bio && (
                      <>
                        <Separator />
                        <div className="text-sm text-gray-700">
                          {userProfile.bio}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Profile Settings */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Profile Information
                        </CardTitle>
                        <CardDescription>
                          Update your profile information and preferences
                        </CardDescription>
                      </div>
                      
                      {!isEditing ? (
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSave}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </Button>
                          <Button
                            onClick={handleCancel}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="display_name">Display Name</Label>
                        {isEditing ? (
                          <Input
                            id="display_name"
                            value={formData.display_name}
                            onChange={(e) => handleInputChange('display_name', e.target.value)}
                            placeholder="Your display name"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 text-black rounded-md text-sm">
                            {userProfile.display_name || 'Not set'}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        {isEditing ? (
                          <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            placeholder="Your username"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 text-black rounded-md text-sm">
                            @{userProfile.username}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Your location"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 text-black rounded-md text-sm">
                          {userProfile.location || 'Not set'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          placeholder="Tell us about yourself"
                          rows={3}
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 text-black rounded-md text-sm min-h-[80px]">
                          {userProfile.bio || 'No bio added yet'}
                        </div>
                      )}
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Account Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userProfile.email && (
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <div className="px-3 py-2 bg-gray-50 text-black rounded-md text-sm">
                              {userProfile.email}
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label>Profile Visibility</Label>
                          <div className="px-3 py-2 bg-gray-50 text-black rounded-md text-sm">
                            <Badge variant={userProfile.is_public_profile ? "default" : "secondary"} className="text-xs">
                              {userProfile.is_public_profile ? "Public" : "Private"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Member Since</Label>
                          <div className="px-3 py-2 bg-gray-50 text-black rounded-md text-sm">
                            {formatDate(userProfile.created_at)}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Last Active</Label>
                          <div className="px-3 py-2 bg-gray-50 text-black rounded-md text-sm">
                            {formatDate(userProfile.last_active)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage