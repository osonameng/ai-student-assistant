"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Upload, Sparkles, BookOpen, BrainCircuit } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header showAuthButtons />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">AI-Powered Study Assistant</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Turn Your Notes Into <span className="text-gradient">Summaries</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Upload your notes, and let AI generate structured study summaries in seconds.
            </p>

            <div className="pt-4">
              <Link href="/login">
                <Button size="lg" className="gap-2 hover-glow text-base px-8">
                  <Upload className="h-5 w-5" />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}