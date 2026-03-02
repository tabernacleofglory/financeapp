
'use client';

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Link as LinkIcon, Video, ImageIcon, FileText, StickyNote, Trash2, Pencil } from "lucide-react";
import type { Resource } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";

interface ResourceCardProps {
  resource: Resource;
  onEdit: (resource: Resource) => void;
}

const ResourceIcon = ({ type }: { type: Resource['type'] }) => {
  const icons = {
    Link: LinkIcon,
    Video: Video,
    Image: ImageIcon,
    Document: FileText,
    Memo: StickyNote,
  };
  const IconComponent = icons[type];
  return <IconComponent className="h-5 w-5 text-muted-foreground" />;
};

const getYouTubeEmbedUrl = (url: string) => {
    let videoId;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch(e) {
        return null;
    }
}

export function ResourceCard({ resource, onEdit }: ResourceCardProps) {
  const firestore = useFirestore();

  const handleDelete = async () => {
    if (!firestore) return;
    if (confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      try {
        await deleteDoc(doc(firestore, "resources", resource.id));
        toast({
          title: "Resource Deleted",
          description: `"${resource.title}" has been successfully deleted.`,
        });
      } catch (error) {
        console.error("Error deleting resource:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not delete the resource. Please try again.",
        });
      }
    }
  };
  
  const embedUrl = resource.type === 'Video' && resource.url ? getYouTubeEmbedUrl(resource.url) : null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{resource.title}</CardTitle>
            <CardDescription>{resource.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(resource)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {resource.type === 'Image' && resource.url && (
            <div className="relative aspect-video w-full">
                <Image src={resource.url} alt={resource.title} layout="fill" objectFit="cover" className="rounded-md" />
            </div>
        )}
        {resource.type === 'Video' && embedUrl && (
            <div className="aspect-video w-full">
                <iframe
                    src={embedUrl}
                    title={resource.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-md border"
                ></iframe>
            </div>
        )}
        {resource.type === 'Memo' && (
            <div className="text-sm text-muted-foreground bg-secondary p-4 rounded-md h-full whitespace-pre-wrap">
                {resource.content}
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="outline" className="flex items-center gap-2">
            <ResourceIcon type={resource.type} />
            {resource.type}
        </Badge>
        {(resource.type === 'Link' || resource.type === 'Document' || (resource.type === 'Video' && !embedUrl)) && resource.url && (
          <Button asChild variant="outline" size="sm">
            <Link href={resource.url} target="_blank" rel="noopener noreferrer">
              Open
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
