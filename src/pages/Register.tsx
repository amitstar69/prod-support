
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic here
    console.log("Registration attempt");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Sign up to get started with ProdSupport</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium leading-none">First Name</label>
                    <Input id="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium leading-none">Last Name</label>
                    <Input id="lastName" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                  <Input id="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
                  <Input id="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">Confirm Password</label>
                  <Input id="confirmPassword" type="password" required />
                </div>
                <Button type="submit" className="w-full">Create Account</Button>
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
              <Button variant="outline" className="w-full">Sign up with Google</Button>
              <Button variant="outline" className="w-full">Sign up with GitHub</Button>
            </div>
            <div className="text-center text-sm mt-6">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-primary hover:underline"
              >
                Sign In
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
