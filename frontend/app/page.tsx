"use client";

import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Save,
  X,
  FileText,
  Code,
  HelpCircle,
} from "lucide-react";

export default function Home() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [content, setContent] = useState("");
  const [vaultOpen, setVaultOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  /* =========================
     CLOSE VAULT
  ========================= */
  const closeVault = useCallback(() => {
    if (dirty) {
      const ok = confirm("Unsaved changes will be lost. Close anyway?");
      if (!ok) return;
    }

    setVaultOpen(false);
    setPassword("");
    setContent("");
    setDirty(false);
    setStatus(null);
  }, [dirty]);

  /* =========================
     SAVE
  ========================= */
  const saveNote = useCallback(
    async (closeAfter = false) => {
      try {
        setStatus("Saving…");

        const payload = content; // freeze content

        const res = await fetch(`${API}/api/note`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, content: payload }),
        });

        if (!res.ok) {
          setStatus("Save failed");
          return;
        }

        setDirty(false);
        setStatus("Saved");

        // ✅ CLOSE ONLY AFTER SAVE COMPLETES
        if (closeAfter) {
          setTimeout(() => {
            closeVault();
          }, 0);
        }
      } catch {
        setStatus("Save error");
      }
    },
    [API, content, password, closeVault]
  );

  /* =========================
     OPEN VAULT
  ========================= */
  async function openVault() {
    if (!password) {
      setStatus("Enter password");
      return;
    }

    try {
      setStatus("Unlocking…");

      const res = await fetch(`${API}/api/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Unlock failed");
        return;
      }

      setContent(data.content || "");
      setVaultOpen(true);
      setDirty(false);
      setStatus(null);
    } catch {
      setStatus("Server not reachable");
    }
  }

  /* =========================
     KEYBOARD SHORTCUTS
  ========================= */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Ctrl + S → Save
      if (e.ctrlKey && e.key === "s" && !e.shiftKey) {
        e.preventDefault();
        if (vaultOpen) saveNote(false);
      }

      // Ctrl + Shift + S → Save & Close
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (vaultOpen) saveNote(true);
      }

      // Ctrl + Esc → Close vault
      if (e.ctrlKey && e.key === "Escape") {
        e.preventDefault();
        if (vaultOpen) closeVault();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [vaultOpen, saveNote, closeVault]);

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      {/* =========================
          LOCK SCREEN
      ========================= */}
      {!vaultOpen && (
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="flex justify-center items-center gap-2 text-2xl">
              <Lock className="text-emerald-600" /> CodeVault
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Enter your vault password
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Vault password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") openVault();
                }}
              />
              <button
                className="absolute right-3 top-2.5 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button className="w-full" onClick={openVault}>
              <Unlock className="mr-2 h-4 w-4" /> Unlock
            </Button>

            {status && (
              <p className="text-center text-sm text-muted-foreground">
                {status}
              </p>
            )}
          </CardContent>
        </Card>
      )}
      {/* =========================
          VAULT EDITOR
      ========================= */}
      <Dialog open={vaultOpen}>
        <DialogContent
          className="max-w-6xl h-[90vh] flex flex-col bg-background shadow-2xl overflow-hidden"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Unlock className="text-emerald-600" /> Vault Editor
            </DialogTitle>
            <Button size="icon" variant="ghost" onClick={closeVault}>
              <X />
            </Button>
          </DialogHeader>

          {/* TABS */}
          <Tabs
            defaultValue="edit"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="edit">
                <FileText className="mr-2 h-4 w-4" /> Edit
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Code className="mr-2 h-4 w-4" /> Preview
              </TabsTrigger>
            </TabsList>

            {/* EDIT */}
            <TabsContent
              value="edit"
              className="flex-1 mt-2 overflow-hidden"
            >
              <Textarea
                className="h-full w-full resize-none font-mono overflow-auto"
                placeholder="Paste Python code, notes, logs, anything…"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setDirty(true);
                }}
              />
            </TabsContent>

            {/* PREVIEW */}
            <TabsContent
              value="preview"
              className="flex-1 mt-2 overflow-auto"
            >
              <div className="prose prose-slate max-w-none bg-muted p-4 rounded-md">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children }) {
                      const isBlock =
                        className && className.startsWith("language-");

                      if (!isBlock) {
                        return (
                          <code className="bg-slate-200 px-1 rounded">
                            {children}
                          </code>
                        );
                      }

                      return (
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded overflow-x-auto">
                          <code>{children}</code>
                        </pre>
                      );
                    },
                  }}
                >
                  {content || "_Nothing to preview_"}
                </ReactMarkdown>
              </div>
            </TabsContent>
          </Tabs>

          {/* ACTION BAR */}
          <div className="flex gap-2 pt-4 items-center">
            <Button className="flex-1" onClick={() => saveNote(false)}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => saveNote(true)}
            >
              Save & Close
            </Button>

            {/* HELP */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                alert(
                  `Keyboard Shortcuts:\n\n` +
                    `Enter → Unlock\n` +
                    `Ctrl + S → Save\n` +
                    `Ctrl + Shift + S → Save & Close\n` +
                    `Ctrl + Esc → Close Vault`
                )
              }
            >
              <HelpCircle />
            </Button>
          </div>

          {status && (
            <p className="text-center text-sm text-muted-foreground pt-2">
              {status}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}