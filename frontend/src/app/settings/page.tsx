"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [proxmoxHost, setProxmoxHost] = useState("192.168.4.93");
  const [proxmoxPort, setProxmoxPort] = useState("8006");
  const [proxmoxUser, setProxmoxUser] = useState("nexops@pve");
  const [proxmoxTokenName, setProxmoxTokenName] = useState("nexops");
  const [proxmoxTokenValue, setProxmoxTokenValue] = useState("");

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Proxmox Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="host" className="text-sm font-medium">
                Host
              </label>
              <Input
                id="host"
                value={proxmoxHost}
                onChange={(e) => setProxmoxHost(e.target.value)}
                placeholder="192.168.1.100"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="port" className="text-sm font-medium">
                Port
              </label>
              <Input
                id="port"
                value={proxmoxPort}
                onChange={(e) => setProxmoxPort(e.target.value)}
                placeholder="8006"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="user" className="text-sm font-medium">
              User
            </label>
            <Input
              id="user"
              value={proxmoxUser}
              onChange={(e) => setProxmoxUser(e.target.value)}
              placeholder="user@pve"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="tokenName" className="text-sm font-medium">
                API Token Name
              </label>
              <Input
                id="tokenName"
                value={proxmoxTokenName}
                onChange={(e) => setProxmoxTokenName(e.target.value)}
                placeholder="token-name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tokenValue" className="text-sm font-medium">
                API Token Value
              </label>
              <Input
                id="tokenValue"
                type="password"
                value={proxmoxTokenValue}
                onChange={(e) => setProxmoxTokenValue(e.target.value)}
                placeholder="Token value"
              />
            </div>
          </div>
          <Button>Save Connection</Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Notification preferences will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
