'use client'
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/login-form";
import RegisterForm from "@/components/register-form";

function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <a href="/" className="absolute left-4 top-4 md:left-8 md:top-8">
        <div className="font-bold">SportsGear</div>
      </a>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to SportsGear</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account or create a new one</p>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default LoginPage;