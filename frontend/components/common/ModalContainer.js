import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useUI } from '../../contexts';

// Import modal components
import InfoModal from './modals/InfoModal';
import ConfirmationModal from './modals/ConfirmationModal';
import ProjectFormModal from './modals/ProjectFormModal';

/**
 * Modal container component
 * Manages rendering of different modals based on UI context state
 */
const ModalContainer = () => {
  const { modal, closeModal } = useUI();
  const { open, type, data } = modal;

  // Function to render the appropriate modal content based on type
  const renderModalContent = () => {
    switch (type) {
      case 'info':
        return <InfoModal data={data} onClose={closeModal} />;
      
      case 'confirmation':
        return <ConfirmationModal data={data} onClose={closeModal} />;
      
      case 'project-form':
        return <ProjectFormModal data={data} onClose={closeModal} />;
      
      default:
        return (
          <div className="px-4 pt-5 pb-4 sm:p-6">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Unknown Modal Type
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No component found for modal type: {type}
                </p>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={closeModal}
      >
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* Center modal contents */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {renderModalContent()}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ModalContainer;
