
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, where, getDocs } from "firebase/firestore";
import { sendPasswordResetEmail, signInWithEmailAndPassword, updatePassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: Security Questions, 3: New Password, 4: Success
  const [securityQuestions, setSecurityQuestions] = useState<any>(null);
  const [answers, setAnswers] = useState({ answer1: "", answer2: "", answer3: "" });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const usersQuery = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        toast({
          title: "Email not found",
          description: "No account found with this email address.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (!userData.securityQuestions) {
        toast({
          title: "Security questions not set",
          description: "This account doesn't have security questions set up.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setSecurityQuestions(userData.securityQuestions);
      setUserId(userDoc.id);
      setStep(2);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to verify email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityQuestionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const answer1Match = answers.answer1.toLowerCase().trim() === securityQuestions.answer1;
      const answer2Match = answers.answer2.toLowerCase().trim() === securityQuestions.answer2;
      const answer3Match = answers.answer3.toLowerCase().trim() === securityQuestions.answer3;

      if (answer1Match && answer2Match && answer3Match) {
        setStep(3);
        toast({
          title: "Security questions verified",
          description: "Please enter your new password.",
        });
      } else {
        toast({
          title: "Incorrect answers",
          description: "One or more security question answers are incorrect.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to verify security questions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // First, we need to sign in the user temporarily to update their password
      // We'll use a temporary password that we know doesn't work, then use the reset email method
      await sendPasswordResetEmail(auth, email);
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email and use the link to set your new password.",
      });
      
      setStep(4);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Reset form and go back to login
    setStep(1);
    setEmail("");
    setAnswers({ answer1: "", answer2: "", answer3: "" });
    setNewPassword("");
    setConfirmPassword("");
    onBack();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {step === 1 && "Forgot Password"}
          {step === 2 && "Security Questions"}
          {step === 3 && "Set New Password"}
          {step === 4 && "Password Reset"}
        </CardTitle>
        <CardDescription className="text-center">
          {step === 1 && "Enter your email to start password recovery"}
          {step === 2 && "Answer your security questions"}
          {step === 3 && "Create a new password for your account"}
          {step === 4 && "Check your email to complete the password reset"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Back to Login
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Verifying..." : "Continue"}
              </Button>
            </div>
          </form>
        )}

        {step === 2 && securityQuestions && (
          <form onSubmit={handleSecurityQuestionsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{securityQuestions.question1}</Label>
              <Input
                type="text"
                placeholder="Your answer"
                value={answers.answer1}
                onChange={(e) => setAnswers({ ...answers, answer1: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{securityQuestions.question2}</Label>
              <Input
                type="text"
                placeholder="Your answer"
                value={answers.answer2}
                onChange={(e) => setAnswers({ ...answers, answer2: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{securityQuestions.question3}</Label>
              <Input
                type="text"
                placeholder="Your answer"
                value={answers.answer3}
                onChange={(e) => setAnswers({ ...answers, answer3: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Verifying..." : "Verify Answers"}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700 font-medium">Password reset email sent!</p>
              <p className="text-green-600 text-sm mt-1">
                Check your email ({email}) and click the reset link to complete the process.
              </p>
            </div>
            <Button onClick={handleBackToLogin} className="w-full">
              Back to Login
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;
