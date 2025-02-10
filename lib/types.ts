export interface IEmail {
  attachments: {
    attachmentId: string;
    filename: string;
  }[];
  snippet: string;
  bodyHTML: string;
  body: string;
  headers: {
    from: string;
    date: string;
    subject: string;
  };
  category: string;
  message_id: string;
}

export interface IAttachment {
  filename: string;
  url: string;
}

export interface IEmailCategoryNumber {
  name: string,
  count: number
}

export interface ICategory {
  name: string;
  description: string;
}

export interface Attachment {
  filename: string;
  attachmentId: string;
}
