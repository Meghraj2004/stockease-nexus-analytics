
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { updatePassword, signInWithEmailAndPassword } from "firebase/auth";

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
  const [userDoc, setUserDoc] = useState<any>(null);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if email exists in users collection
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

      const userDocument = querySnapshot.docs[0];
      const userData = userDocument.data();
      
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
      setUserDoc({ id: userDocument.id, ...userData });
      setStep(2);
    } catch (error: any) {
      console.error("Email verification error:", error);
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
      // Check if all 3 answers match exactly (case-insensitive)
      const answer1Match = answers.answer1.toLowerCase().trim() === securityQuestions.answer1.toLowerCase().trim();
      const answer2Match = answers.answer2.toLowerCase().trim() === securityQuestions.answer2.toLowerCase().trim();
      const answer3Match = answers.answer3.toLowerCase().trim() === securityQuestions.answer3.toLowerCase().trim();

      if (answer1Match && answer2Match && answer3Match) {
        setStep(3);
        toast({
          title: "Security questions verified",
          description: "Please enter your new password.",
        });
      } else {
        toast({
          title: "Answers didn't match our records",
          description: "Please try again with the correct answers.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Security questions verification error:", error);
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
      // First, sign in the user with their current credentials to get authentication context
      // We need to use the stored password from the user document
      if (!userDoc.password) {
        toast({
          title: "Error",
          description: "Unable to verify current credentials.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Sign in with current credentials
      await signInWithEmailAndPassword(auth, email, userDoc.password);
      
      // Now update the password
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        
        // Update the password in Firestore as well
        await updateDoc(doc(db, "users", userDoc.id), {
          password: newPassword,
          lastPasswordUpdate: new Date(),
        });

        toast({
          title: "Password updated successfully",
          description: "Your password has been changed. You can now login with your new password.",
        });
        
        setStep(4);
      }
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      if (error.code === 'auth/wrong-password') {
        toast({
          title: "Error",
          description: "Current password verification failed.",
          variant: "destructive",
        });
      } else if (error.code === 'auth/weak-password') {
        toast({
          title: "Weak password",
          description: "Please choose a stronger password.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error", 
          description: "Failed to update password. Please try again.",
          variant: "destructive",
        });
      }
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
    setSecurityQuestions(null);
    setUserDoc(null);
    onBack();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {step === 1 && "Forgot Password"}
          {step === 2 && "Security Questions"}
          {step === 3 && "Set New Password"}
          {step === 4 && "Password Updated"}
        </CardTitle>
        <CardDescription className="text-center">
          {step === 1 && "Enter your registered email address"}
          {step === 2 && "Answer your security questions to verify your identity"}
          {step === 3 && "Create a new password for your account"}
          {step === 4 && "Your password has been successfully updated"}
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
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700 font-medium">Password updated successfully!</p>
              <p className="text-green-600 text-sm mt-1">
                You can now login with your new password.
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
