'use client'

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from '@chakra-ui/react'
import { color } from 'framer-motion'

export const toaster = createToaster({
  placement: 'bottom-end',
  pauseOnPageIdle: true,
})

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
        {(toast) => {

          const toastRootBaseProps = { width: { md: 'sm' } };
          let customToastRootProps = {};

          // Style modifications for success toasts
          if (toast.type === 'success') {
            customToastRootProps = {
              ...customToastRootProps,
              bg: '#003459',
              borderColor: '#003459',
              borderWidth: '1px',
              color: 'white', // Letra blanca
            };
          }
          // Style modifications for loading toasts
          if (toast.type === 'loading') {
            customToastRootProps = {
              ...customToastRootProps,
              bg: '#003459',
              borderColor: '#003459',
              borderWidth: '1px',
              color: 'white', // Letra blanca
            };
          }

          return (
            <Toast.Root {...toastRootBaseProps} {...customToastRootProps}>
              {toast.type === 'loading' ? (
                <Spinner size='sm' color='white' />
              ) : (
                <Toast.Indicator />
              )}
              <Stack gap='1' flex='1' maxWidth='100%'>
                {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
                {toast.description && (
                  <Toast.Description>{toast.description}</Toast.Description>
                )}
              </Stack>
              {toast.action && (
                <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
              )}
              {toast.closable && <Toast.CloseTrigger />}
            </Toast.Root>
          );
        }}
      </ChakraToaster>
    </Portal>
  )
}
