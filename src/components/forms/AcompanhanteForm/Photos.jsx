import { Button, Group, Text, useMantineTheme } from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import { IconCloudUpload, IconDownload, IconX } from '@tabler/icons-react'
import React, { useRef } from 'react'

import classes from './AcompanhanteForm.module.css'

export default function Photos({ onFileUpload }) {
  // Hooks
  const theme = useMantineTheme();
  const openRef = useRef(null);

  return (
    <div className={classes.wrapper}>
      <Dropzone
        openRef={openRef}
        onDrop={onFileUpload}
        className={classes.dropzone}
        radius="md"
        accept={['image/gif', 'image/png', 'image/jpeg']}
        maxSize={30 * 1024 ** 2}
      >
        <div style={{ pointerEvents: 'none' }}>
          <Group justify="center">
            <Dropzone.Accept>
              <IconDownload style={{ width: 50, height: 50 }} color={theme.colors.blue[6]} stroke={1.5} />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX style={{ width: 50, height: 50 }} color={theme.colors.red[6]} stroke={1.5} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconCloudUpload style={{ width: 50, height: 50 }} stroke={1.5} />
            </Dropzone.Idle>
          </Group>

          <Text ta="center" fw={700} fz="lg" mt="xl">
            <Dropzone.Accept>Arraste os arquivos aqui</Dropzone.Accept>
            <Dropzone.Reject>Arquivo menor que 30mb</Dropzone.Reject>
            <Dropzone.Idle>Upload fotos</Dropzone.Idle>
          </Text>
          <Text ta="center" fz="sm" mt="xs" c="dimmed">
            Arraste os arquivos aqui para subir as fotos.<br />
            Apenas imagens no formato <strong>.gif, .png, .jpg, .jpeg</strong> que são menores que 30mb.
          </Text>
        </div>
      </Dropzone>

      <Button className={classes.control} size="md" radius="xl" onClick={() => openRef.current?.()}>
        Selecionar arquivos
      </Button>
    </div>
  )
}
