import type { Metadata } from "next";
import Link from "next/link";
import { User, ExternalLink, Shield, FileText } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { ROLES, type Role } from "@/lib/constants";
import { DEMO_MODE } from "@/lib/demo";
import type { BadgeProps } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/demo-badge";
import { SignOutButton } from "@/components/settings/sign-out-button";

export const metadata: Metadata = { title: "Settings" };

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  agent: "Agent",
};

const ROLE_TONE: Record<Role, NonNullable<BadgeProps["tone"]>> = {
  super_admin: "primary",
  admin: "gold",
  agent: "neutral",
};

export default async function SettingsPage() {
  const user = await requireOnboardedUser();
  const slug = user.profile?.slug;
  const admin = user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Tetapan akaun anda.</p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Akaun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Emel
              </p>
              <p className="truncate font-medium">{user.email}</p>
            </div>
            <Badge tone={ROLE_TONE[user.role]}>{ROLE_LABELS[user.role]}</Badge>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button asChild variant="outline">
              <Link href="/profile">
                <User className="h-4 w-4" /> Profil Saya
              </Link>
            </Button>
            {slug ? (
              <Button asChild variant="outline">
                <Link href={`/agent/${slug}`}>
                  <ExternalLink className="h-4 w-4" /> Profil Awam
                </Link>
              </Button>
            ) : null}
            {admin ? (
              <Button asChild variant="outline">
                <Link href="/admin">
                  <Shield className="h-4 w-4" /> Admin Panel
                </Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Demo mode */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEMO_MODE ? (
            <>
              <DemoBadge />
              <p className="text-sm text-muted-foreground">
                Aplikasi sedang berjalan dalam mod demo. Sebahagian data mungkin
                contoh sahaja.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Demo Mode tidak aktif. Semua data adalah data sebenar anda.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Legal */}
      <Card>
        <CardHeader>
          <CardTitle>Perundangan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/legal/privacy">
              <FileText className="h-4 w-4" /> Privasi
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/legal/terms">
              <FileText className="h-4 w-4" /> Terma
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="pt-2">
        <SignOutButton />
      </div>
    </div>
  );
}
