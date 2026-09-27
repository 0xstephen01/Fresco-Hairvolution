import { useEffect, useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo, Wordmark } from "@/components/Brand";
import { useDB, remoteEnabled, loadBookings, pushLocalData } from "@/lib/store";
import { ownerSignIn, ownerSignOut, currentOwner, onOwnerChange } from "@/lib/remote";
import { navigate } from "@/lib/router";
import { AdminBookings } from "@/components/admin/AdminBookings";
import { AdminServices } from "@/components/admin/AdminServices";
import { AdminCoverage } from "@/components/admin/AdminCoverage";
import { AdminSchedule } from "@/components/admin/AdminSchedule";
import { AdminSettings } from "@/components/admin/AdminSettings";

const SESSION_KEY = "fresco.owner.session";

export function Admin() {
  const db = useDB();
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!remoteEnabled) {
      try {
        setUnlocked(localStorage.getItem(SESSION_KEY) === "yes");
      } catch {
        setUnlocked(false);
      }
      return;
    }
    let alive = true;
    void currentOwner().then(async (owner) => {
      if (!alive) return;
      setUnlocked(Boolean(owner));
      if (owner) {
        await pushLocalData();
        void loadBookings();
      }
    });
    const stop = onOwnerChange((owner) => {
      setUnlocked(Boolean(owner));
      if (owner) void loadBookings();
    });
    return () => {
      alive = false;
      stop();
    };
  }, []);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (remoteEnabled) {
      setBusy(true);
      try {
        await ownerSignIn(email.trim(), password);
        await pushLocalData();
        await loadBookings();
        setPassword("");
        toast.success("Signed in. Only you can see this area.");
      } catch {
        setError("That email and password did not match. Check them and try again.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (pin.trim() === db.settings.ownerPin) {
      try {
        localStorage.setItem(SESSION_KEY, "yes");
      } catch {
        /* ignore */
      }
      setUnlocked(true);
      setPin("");
      toast.success("Signed in. Only you can see this area.");
      return;
    }
    setError("That PIN is not right. Check the owner PIN in Settings, or ask whoever set this up.");
  }

  async function signOut() {
    if (remoteEnabled) await ownerSignOut();
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setUnlocked(false);
    toast.success("Signed out of the owner area.");
    navigate("/");
  }

  if (!unlocked) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2.5">
            <Logo />
            <Wordmark className="text-base" />
          </div>
          <div className="mt-6 flex items-center gap-2 text-primary">
            <ShieldCheck className="size-4" />
            <p className="eyebrow">Owner area</p>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Sign in to manage bookings</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {remoteEnabled
              ? "Sign in with your owner email and password to see booking requests, edit prices and change the areas you cover."
              : "Enter your owner PIN to see booking requests, edit prices and change the areas you cover."}
          </p>

          <form onSubmit={signIn} className="mt-6">
            {remoteEnabled ? (
              <>
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  className="mt-2 h-11"
                  aria-invalid={Boolean(error)}
                />
                <label htmlFor="password" className="mt-4 block text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  className="mt-2 h-11"
                  aria-invalid={Boolean(error)}
                />
              </>
            ) : (
              <>
                <label htmlFor="pin" className="text-sm font-medium">
                  Owner PIN
                </label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  autoComplete="current-password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError("");
                  }}
                  placeholder="••••"
                  className="mt-2 h-11"
                  aria-invalid={Boolean(error)}
                />
              </>
            )}
            {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="mt-5 h-11 w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {remoteEnabled
              ? "This is a real login. Only your account can read booking requests, and customers can never see them."
              : "The PIN starts as 2468 and can be changed in Settings. This keeps customers out of your panel; it is not a secure login until the app is linked to a backend."}
          </p>
          <Button variant="ghost" className="mt-4 h-11 w-full" onClick={() => navigate("/")}>
            Back to the site
          </Button>
        </div>
      </main>
    );
  }

  const pending = db.bookings.filter((b) => b.status === "new").length;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="eyebrow">Owner area</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Fresco's dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {db.bookings.length} booking{db.bookings.length === 1 ? "" : "s"}
            {remoteEnabled ? " on the server" : " on this device"}, {pending} waiting on your reply.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-11" onClick={() => navigate("/")}>
            View the site
          </Button>
          <Button variant="ghost" className="h-11 text-muted-foreground" onClick={signOut}>
            <LogOut />
            Sign out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="bookings" className="mt-8">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="h-11">
            <TabsTrigger value="bookings" className="h-10 px-4">
              Bookings
              {pending > 0 ? (
                <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {pending}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="services" className="h-10 px-4">
              Services & prices
            </TabsTrigger>
            <TabsTrigger value="coverage" className="h-10 px-4">
              Coverage & fees
            </TabsTrigger>
            <TabsTrigger value="schedule" className="h-10 px-4">
              Hours & days off
            </TabsTrigger>
            <TabsTrigger value="settings" className="h-10 px-4">
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="bookings" className="mt-6">
          <AdminBookings />
        </TabsContent>
        <TabsContent value="services" className="mt-6">
          <AdminServices />
        </TabsContent>
        <TabsContent value="coverage" className="mt-6">
          <AdminCoverage />
        </TabsContent>
        <TabsContent value="schedule" className="mt-6">
          <AdminSchedule />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <AdminSettings />
        </TabsContent>
      </Tabs>
    </main>
  );
}
