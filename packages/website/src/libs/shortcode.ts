import { chassisAutoImport } from '@chassis-ui/docs'
import { getDocsFsPath } from './path'

export const { integration: chassisAutoImportIntegration, plugin: chassisAutoImportPlugin } =
  chassisAutoImport({ docsPath: getDocsFsPath() })
