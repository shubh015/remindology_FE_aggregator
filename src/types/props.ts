// Shared component prop interfaces

export interface ContentTabProps {
  contentId: string;
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}
