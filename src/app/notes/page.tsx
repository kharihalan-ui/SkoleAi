'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Plus, Trash, Sparkles, Notebook } from 'lucide-react';
import { enhanceNote } from '@/ai/flows/note-enhancer';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type Note = {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({
    title: '',
    content: '',
    category: '',
  });
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  const handleSaveNote = () => {
    if (!currentNote.content) return;
    const newNote: Note = {
      id: Date.now(),
      title: currentNote.title || 'Untitled Note',
      content: currentNote.content,
      category: currentNote.category || 'General',
      createdAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setCurrentNote({ title: '', content: '', category: '' });
  };

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const handleEnhanceNote = async (type: 'summarize' | 'expand' | 'clarify' | 'addExamples') => {
    if (!currentNote.content || currentNote.content.length < 20) {
      toast({ title: 'Add content', description: 'Write at least 20 characters to enhance.', variant: 'destructive' });
      return;
    }
    setIsEnhancing(true);
    try {
      const result = await enhanceNote({ noteContent: currentNote.content, enhancementType: type });
      setCurrentNote({ ...currentNote, content: result.enhancedNote });
      toast({ title: 'Enhanced!', description: `Notes ${type === 'summarize' ? 'summarized' : type === 'expand' ? 'expanded' : type === 'clarify' ? 'clarified' : 'updated with examples'}.` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to enhance notes.', variant: 'destructive' });
    } finally {
      setIsEnhancing(false);
    }
  };
  
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in-50 duration-500">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">Smart Notes</h1>
        <p className="text-muted-foreground mt-2">
          Capture and organize your ideas. Audio transcription coming soon!
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Title"
                value={currentNote.title}
                onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
              />
              <Textarea
                placeholder="Start writing your note..."
                className="min-h-[150px]"
                value={currentNote.content}
                onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
              />
              <Input
                placeholder="Category (e.g., Biology)"
                value={currentNote.category}
                onChange={(e) => setCurrentNote({ ...currentNote, category: e.target.value })}
              />
              <div className="flex flex-wrap gap-2">
                 <Button onClick={handleSaveNote}>
                    <Plus/> Save Note
                 </Button>
                 <Button variant="outline" size="sm" onClick={() => handleEnhanceNote('clarify')} disabled={isEnhancing}>
                    <Sparkles/> Clarify
                 </Button>
                 <Button variant="outline" size="sm" onClick={() => handleEnhanceNote('expand')} disabled={isEnhancing}>
                    <Sparkles/> Expand
                 </Button>
                 <Button variant="outline" size="sm" onClick={() => handleEnhanceNote('summarize')} disabled={isEnhancing}>
                    <Sparkles/> Summarize
                 </Button>
                 <Button variant="outline" size="sm" onClick={() => handleEnhanceNote('addExamples')} disabled={isEnhancing}>
                    <Sparkles/> Add Examples
                 </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
            {notes.length === 0 ? (
                <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center text-muted-foreground pt-6">
                        <Notebook className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-semibold">No notes yet</h3>
                        <p>Create your first note to get started.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {notes.map(note => (
                        <Card key={note.id} className="animate-in fade-in-50 duration-500">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{note.title}</CardTitle>
                                        <CardDescription>
                                            {note.category} &bull; {format(note.createdAt, 'PPp')}
                                        </CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)}>
                                        <Trash />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
