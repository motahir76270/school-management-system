import z from "zod";

class ClassValidation {
     static get classNoteSchema(){
    return z.object({
  title: z.string().min(1, 'The title field is required.'),
  chapter: z.string().optional(),
  description: z.string().optional(),
  school_class_id: z.string().min(1, 'The school class id field is required.'),
  section_id: z.string().min(1, 'The section id field is required.'),
  subject_id: z.string().min(1, 'The subject id field is required.'),
  file_type: z.string().min(1, 'The file type field is required.'),
  file_url: z.string().optional().nullable(),
  video_url: z.string().optional().nullable(),
})
     }
}

export default ClassValidation