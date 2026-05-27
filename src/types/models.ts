export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string | null;
  language: string[];
  role: string[];
  stage: string[];
  tags: string[];
  isFavorite: boolean;
  versions: PromptVersion[];
  visibility?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptVersion {
  content: string;
  description?: string;
  createdAt: string;
}

export interface PromptCreateInput {
  title: string;
  content: string;
  description?: string;
  language?: string[];
  role?: string[];
  stage?: string[];
  tags?: string[];
  visibility?: string;
}

export interface PromptUpdateInput extends Partial<PromptCreateInput> {
  isFavorite?: boolean;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string | null;
  stages: ProjectStage[];
  visibility?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStage {
  id: string;
  projectTemplateId: string;
  name: string;
  order: number;
  promptIds: string[];
  primaryPromptId: string | null;
  prompt?: Prompt;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  visibility?: string;
  prompts: Prompt[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  user: User;
}
