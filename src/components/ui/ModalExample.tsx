import React from 'react';
import { useModal, useConfirmDialog } from '../../hooks/useModal';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';

export default function ModalExample() {
  const { isOpen, open, close } = useModal();
  const { isOpen: isConfirmOpen, open: openConfirm, close: closeConfirm, config } = useConfirmDialog();

  const handleDeleteClick = () => {
    openConfirm(
      'Delete Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      () => {
        console.log('Item deleted!');
        // Perform delete action here
      },
      'Delete',
      'Cancel',
      'danger'
    );
  };

  const handleWarningClick = () => {
    openConfirm(
      'Warning',
      'This action will affect multiple items. Do you want to continue?',
      () => {
        console.log('Warning action confirmed!');
        // Perform warning action here
      },
      'Continue',
      'Cancel',
      'warning'
    );
  };

  const handleInfoClick = () => {
    openConfirm(
      'Information',
      'This is an informational message. Click OK to proceed.',
      () => {
        console.log('Info action confirmed!');
        // Perform info action here
      },
      'OK',
      'Cancel',
      'info'
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Modal System Examples</h3>
      
      <div className="flex space-x-2">
        <button
          onClick={open}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Open Custom Modal
        </button>
        
        <button
          onClick={handleDeleteClick}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Delete Confirmation
        </button>
        
        <button
          onClick={handleWarningClick}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
        >
          Warning Dialog
        </button>
        
        <button
          onClick={handleInfoClick}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Info Dialog
        </button>
      </div>

      {/* Custom Modal */}
      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Custom Modal Example"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This is an example of a custom modal. You can put any content here.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Features:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Responsive design</li>
              <li>• Keyboard navigation (ESC to close)</li>
              <li>• Focus management</li>
              <li>• Click outside to close</li>
              <li>• Multiple sizes available</li>
            </ul>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              onClick={close}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                console.log('Action performed!');
                close();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Perform Action
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog */}
      {config && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={closeConfirm}
          onConfirm={config.onConfirm}
          title={config.title}
          message={config.message}
          confirmText={config.confirmText}
          cancelText={config.cancelText}
          variant={config.variant}
        />
      )}
    </div>
  );
} 