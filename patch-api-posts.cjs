const fs = require('fs');
const filePath = 'k:/jg_inovative_hub/JG-INNOVATIVE-HUB_Frontend/src/services/api.ts';
let content = fs.readFileSync(filePath, 'utf8');

const interfaceStr = `
export interface InternshipPost {
  _id: string;
  title: string;
  description: string;
  category: 'paid' | 'self-funded';
  tier?: string;
  skills: string[];
  isActive: boolean;
}
`;

if (!content.includes('export interface InternshipPost')) {
  content = content.replace('export interface InternshipApplication', interfaceStr + '\\nexport interface InternshipApplication');
}

const apiStr = `
  getPosts: async (): Promise<InternshipPost[]> => {
    return fetchWithAuth('/internships/posts');
  },
`;

if (!content.includes('getPosts: async')) {
  content = content.replace('internshipsApi = {', 'internshipsApi = {' + apiStr);
  fs.writeFileSync(filePath, content);
}
