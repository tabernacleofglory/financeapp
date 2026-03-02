

'use client';

import React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, orderBy, query, updateDoc, arrayUnion, serverTimestamp, doc } from 'firebase/firestore';
import type { Feedback, UserProfile, Reply } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Send, Smile, Paperclip, Mail, User, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';


const FeedbackItem = ({ feedback, onSelect }: { feedback: Feedback, onSelect: (feedback: Feedback) => void }) => {
    const firestore = useFirestore();
    const userDocRef = useMemoFirebase(
        () => (firestore && feedback.userId) ? doc(firestore, 'users', feedback.userId) : null,
        [firestore, feedback.userId]
    );
    const { data: userProfile } = useDoc<UserProfile>(userDocRef);

    return (
        <div className="flex items-start gap-4 p-4 border-b hover:bg-muted/50 cursor-pointer" onClick={() => onSelect(feedback)}>
            <Avatar className="h-10 w-10">
                <AvatarImage src={userProfile?.photoURL} />
                <AvatarFallback>{feedback.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1 flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{feedback.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {feedback.date?.seconds
                        ? formatDistanceToNow(new Date(feedback.date.seconds * 1000), { addSuffix: true })
                        : 'Just now'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{feedback.type}</Badge>
                    <p className="text-xs text-muted-foreground">{feedback.email}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2 truncate">{feedback.message}</p>
            </div>
        </div>
    )
}

const ReplyItem = ({ reply }: { reply: Reply }) => {
    const firestore = useFirestore();
    const userDocRef = useMemoFirebase(
        () => (firestore && reply.userId) ? doc(firestore, 'users', reply.userId) : null,
        [firestore, reply.userId]
    );
    const { data: userProfile } = useDoc<UserProfile>(userDocRef);

    const getFormattedDate = () => {
        if (!reply.createdAt) return 'Just now';
        const date = reply.createdAt.seconds ? new Date(reply.createdAt.seconds * 1000) : reply.createdAt;
        return formatDistanceToNow(date, { addSuffix: true });
    }

    return (
        <div className="flex gap-3 py-4">
            <Avatar>
                <AvatarImage src={userProfile?.photoURL} />
                <AvatarFallback>{userProfile?.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div className="font-semibold">{userProfile?.name || 'User'}</div>
                    <div className="text-xs text-muted-foreground">
                         {getFormattedDate()}
                    </div>
                </div>
                <div className="text-sm text-foreground whitespace-pre-wrap rounded-lg bg-muted p-3 mt-1">
                    {reply.message}
                </div>
            </div>
        </div>
    );
}

const FeedbackSheetContent = ({ feedback }: { feedback: Feedback | null }) => {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const [replyMessage, setReplyMessage] = React.useState('');

    const userDocRef = useMemoFirebase(
      () => (firestore && feedback?.userId) ? doc(firestore, 'users', feedback.userId) : null,
      [firestore, feedback?.userId]
    );
    const { data: userProfile } = useDoc<UserProfile>(userDocRef);

    if (!feedback) return null;

    const handleSendReply = async () => {
        if (!firestore || !user || !replyMessage.trim() || !feedback.id) return;
    
        const feedbackRef = doc(firestore, 'feedback', feedback.id);
    
        try {
            await updateDoc(feedbackRef, {
                replies: arrayUnion({
                    userId: user.uid,
                    message: replyMessage.trim(),
                    createdAt: new Date(),
                })
            });
            setReplyMessage('');
            toast({
                title: "Reply Sent",
                description: "Your reply has been added to the feedback thread.",
            });
        } catch (error) {
            console.error("Error sending reply: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not send your reply. Please try again.",
            });
        }
    };
    
    const feedbackDate = feedback.date?.seconds
                        ? formatDistanceToNow(new Date(feedback.date.seconds * 1000), { addSuffix: true })
                        : 'Just now';


    return (
        <>
            <SheetHeader className="bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground p-6 rounded-t-lg -m-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <SheetTitle className="text-2xl text-primary-foreground">Feedback Details</SheetTitle>
                        <SheetDescription className="text-primary-foreground/80 mt-1">
                            Reviewing submission for <span className="font-semibold">{feedback.name}</span>
                        </SheetDescription>
                    </div>
                     <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-transparent shrink-0">
                        {feedback.type}
                    </Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-primary-foreground/80 pt-4">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{feedback.name}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{feedback.email}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{feedbackDate}</span>
                    </div>
                </div>
            </SheetHeader>
            <ScrollArea className="flex-grow pr-4 -mr-6">
                <div className="flex gap-3 py-4">
                    <Avatar>
                        <AvatarImage src={userProfile?.photoURL} />
                        <AvatarFallback>{feedback.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="font-semibold">{feedback.name}</div>
                        <div className="text-sm text-foreground whitespace-pre-wrap rounded-lg bg-muted p-3 mt-1">
                            {feedback.message}
                        </div>
                    </div>
                </div>
                 {feedback.replies && feedback.replies.length > 0 && (
                    <>
                        <Separator />
                        <div className="py-2">
                            {feedback.replies.map((reply, index) => (
                                <ReplyItem key={index} reply={reply} />
                            ))}
                        </div>
                    </>
                )}
            </ScrollArea>
            <SheetFooter className="mt-auto flex-none border-t pt-4">
                 <div className="flex w-full items-center gap-2">
                    <Textarea
                        id="reply-message"
                        placeholder="Type your response here..."
                        className="flex-1 resize-none"
                        rows={1}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                    />
                    <Button type="button" variant="ghost" size="icon">
                        <Smile className="h-5 w-5" />
                        <span className="sr-only">Add emoji</span>
                    </Button>
                    <Button type="button" variant="ghost" size="icon">
                        <Paperclip className="h-5 w-5" />
                        <span className="sr-only">Add attachment</span>
                    </Button>
                    <Button type="submit" size="icon" onClick={handleSendReply} disabled={!replyMessage.trim()}>
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Send</span>
                    </Button>
                </div>
            </SheetFooter>
        </>
    )
}

export default function InquiriesPage() {
  const firestore = useFirestore();
  const [selectedFeedback, setSelectedFeedback] = React.useState<Feedback | null>(null);

  const feedbackQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'feedback'), orderBy('date', 'desc')) : null,
    [firestore]
  );
  const { data: feedback, isLoading } = useCollection<Feedback>(feedbackQuery);

  const handleSelectFeedback = (feedbackItem: Feedback) => {
    setSelectedFeedback(feedbackItem);
  }

  const handleSheetOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        setSelectedFeedback(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Inquiries"
        description="Review user-submitted feedback."
      />
      <Card>
        <CardHeader>
            <CardTitle>Feedback Submissions</CardTitle>
            <CardDescription>All feedback from the application is displayed here, ordered by most recent.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-250px)]">
                {isLoading ? (
                    <div className="space-y-4 p-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : feedback && feedback.length > 0 ? (
                    feedback.map(item => (
                        <FeedbackItem key={item.id} feedback={item} onSelect={handleSelectFeedback} />
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full p-10">
                        <p className="text-muted-foreground">No feedback submissions yet.</p>
                    </div>
                )}
            </ScrollArea>
        </CardContent>
      </Card>
      
      <Sheet open={!!selectedFeedback} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="sm:max-w-lg w-full flex flex-col">
            <FeedbackSheetContent feedback={selectedFeedback} />
        </SheetContent>
      </Sheet>
    </>
  );
}
