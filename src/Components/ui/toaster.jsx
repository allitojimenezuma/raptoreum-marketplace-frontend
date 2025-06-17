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
              bg: '#003459', // Light grey background for success
              borderColor: '#003459', // Optional: a slightly darker border
              borderWidth: '1px',
            };
          }

          return (
            <Toast.Root {...toastRootBaseProps} {...customToastRootProps}>
              {toast.type === 'loading' ? (
                <Spinner size='sm' color='blue.solid' />
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
