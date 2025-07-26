import type { Route } from "../../+types/root";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Info, Trash2, Download, Shield } from "lucide-react";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Data Deletion | Lemore" },
    { name: "description", content: "User Data Deletion Information for Lemore" },
  ];
};

export default function DataDeletionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Data Deletion Information</h1>
      
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This page explains how you can request deletion of your personal data from Lemore.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Your Data Rights
            </CardTitle>
            <CardDescription>
              You have the right to access, modify, and delete your personal data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What data we store:</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Account information (name, email, profile details)</li>
                <li>Content you've posted (listings, reviews, tips)</li>
                <li>Messages and communications</li>
                <li>Activity logs and usage data</li>
                <li>Location data (when provided)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Request Your Data
            </CardTitle>
            <CardDescription>
              Get a copy of all your personal data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              You can request a copy of all your personal data that we store. This includes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Your profile information</li>
              <li>All content you've posted</li>
              <li>Message history</li>
              <li>Activity logs</li>
            </ul>
            <Button variant="outline" className="w-full">
              Request Data Export
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Your Account
            </CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notice</h4>
              <p className="text-yellow-700 text-sm">
                Account deletion is permanent and cannot be undone. All your data, including:
              </p>
              <ul className="list-disc pl-6 text-yellow-700 text-sm mt-2 space-y-1">
                <li>Your profile and account information</li>
                <li>All your product listings</li>
                <li>Community posts and reviews</li>
                <li>Message history</li>
                <li>Activity data</li>
              </ul>
              <p className="text-yellow-700 text-sm mt-2">
                will be permanently deleted and cannot be recovered.
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-700">
                To delete your account, please contact us at:
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">Email: privacy@lemore.com</p>
                <p className="text-sm text-gray-600">Subject: Account Deletion Request</p>
              </div>
            </div>

            <Button variant="destructive" className="w-full">
              Request Account Deletion
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing Time</CardTitle>
            <CardDescription>
              How long it takes to process your request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Data Export Request:</span>
                <span className="text-gray-600">Within 30 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Account Deletion:</span>
                <span className="text-gray-600">Within 30 days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Get in touch with us for data-related requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-gray-700">
                For any questions about your data or to submit requests:
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">Email: privacy@lemore.com</p>
                <p className="text-sm text-gray-600">We typically respond within 48 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
} 