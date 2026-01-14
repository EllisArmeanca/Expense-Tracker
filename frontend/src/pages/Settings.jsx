import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SettingsPage = () => {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Configure your account settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Manage your preferences and account settings</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;