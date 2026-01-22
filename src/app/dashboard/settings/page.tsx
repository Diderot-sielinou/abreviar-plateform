/**
 * Settings Page
 */

import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { formatCompactNumber } from "@/app/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, Avatar, AvatarImage, AvatarFallback, Input } from "@/components/ui";
import { User, Mail, Shield, Trash2, Link2, MousePointerClick, Github } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) return null;

  const stats = await getUserStats(user.id);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-tangerine" />
            Profile
          </CardTitle>
          <CardDescription>Your public profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} alt={user.name || ""} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <h3 className="font-display text-xl font-semibold">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="default">
                  {user.plan === "ENTERPRISE" ? "Enterprise" : user.plan === "PRO" ? "Pro" : "Free"}
                </Badge>
                <span className="text-xs text-muted-foreground">Plan</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <label className="text-sm font-medium mb-2 block">Display Name</label>
            <div className="flex gap-3">
              <Input defaultValue={user.name || ""} className="max-w-sm" />
              <Button variant="outline">Update</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-tangerine" />
            Connected Accounts
          </CardTitle>
          <CardDescription>Manage your authentication methods.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Badge variant="success">Connected</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">GitHub</p>
                  <p className="text-sm text-muted-foreground">OAuth authentication</p>
                </div>
              </div>
              <Badge variant="success">Connected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>Your account usage this billing period.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <Link2 className="w-5 h-5 text-tangerine" />
                <span className="text-sm text-muted-foreground">Links Created</span>
              </div>
              <p className="text-2xl font-display font-bold">{formatCompactNumber(stats.totalLinks)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {user.plan === "FREE" ? "Unlimited" : "Unlimited"} allowed
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <MousePointerClick className="w-5 h-5 text-tangerine" />
                <span className="text-sm text-muted-foreground">Total Clicks</span>
              </div>
              <p className="text-2xl font-display font-bold">{formatCompactNumber(stats.totalClicks)}</p>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions. Please be careful.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all your data.
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function getUserStats(userId: string) {
  const [totalLinks, totalClicks] = await Promise.all([
    db.link.count({ where: { userId } }),
    db.click.count({ where: { link: { userId } } }),
  ]);

  return { totalLinks, totalClicks };
}
