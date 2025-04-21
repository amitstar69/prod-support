
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                  <Input id="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
                  <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">Sign In</Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex items-center justify-center w-full">
              <div className="border-t border-gray-200 flex-grow mr-2"></div>
              <span className="text-xs text-gray-500">OR</span>
              <div className="border-t border-gray-200 flex-grow ml-2"></div>
            </div>
            <div className="flex flex-col w-full space-y-2">
              <Button variant="outline" className="w-full">Sign in with Google</Button>
              <Button variant="outline" className="w-full">Sign in with GitHub</Button>
            </div>
            <div className="text-center text-sm mt-6">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-primary hover:underline"
              >
                Register
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
