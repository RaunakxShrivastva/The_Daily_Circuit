export interface Source {
  title: string;
  kind: "paper" | "dataset" | "filing" | "interview" | "dataset-note" | "speech";
  detail: string;
  date: string;
}

export interface TimelineEvent {
  when: string;
  title: string;
  body: string;
}

export interface Story {
  id: string;
  no: number;
  kicker: string;
  headline: string;
  standfirst: string;
  byline: string;
  dateline: string;
  readTime: string;
  photo: string;
  photoCaption: string;
  body: string[];
  pullQuote?: string;
  sources: Source[];
  timeline: TimelineEvent[];
  tags: string[];
  featured?: boolean;
  url?: string;          // link to original source
}


export interface Edition {
  name: string;
  issueDate: string;
  issueNo: string;
  price: string;
  city: string;
  stories: Story[];
  colophon: string[];
}
