import { useState, type FC } from 'react'

import '@blocknote/core/fonts/inter.css'

import { BlockNoteView } from '@blocknote/mantine'

import '@blocknote/mantine/style.css'

import { es } from '@blocknote/core/locales'
import { useCreateBlockNote } from '@blocknote/react'

const RelatoForm: FC = () => {
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [phone, setPhone] = useState('')
  const [dni, setDni] = useState<File | null>(null)
  const storedTheme = localStorage.getItem('theme') || 'light'

  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: 'heading',
        content: 'Titulo de tu relato'
      },
      {
        type: 'paragraph',
        content: 'Este es el contenido del relato, puedes teclea o presiona / para ver mas comandos'
      }
    ],
    dictionary: es,
    disableExtensions: ['image', 'codeBlock', 'file', 'audio'],
    uploadFile: async () => {
      // We are not allowing file uploads, so we will return an empty string.
      return ''
    }
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const content = await editor.blocksToMarkdownLossy(editor.document)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('surname', surname)
    formData.append('phone', phone)
    if (dni) {
      formData.append('dni', dni)
    }
    formData.append('content', content)

    console.log('Form data:', {
      name,
      surname,
      phone,
      dni,
      content
    })
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        <div>
          <label htmlFor='name' className='mb-2 block font-bold text-gray-700'>
            Nombre
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='placeholder:text-muted-foreground border-foreground w-full border-2 px-4 py-2 shadow-sm'
            placeholder='ej. Juan Pedro'
            required
          />
        </div>
        <div>
          <label htmlFor='surname' className='mb-2 block font-bold text-gray-700'>
            Apellido
          </label>
          <input
            type='text'
            id='surname'
            name='surname'
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className='placeholder:text-muted-foreground border-foreground w-full border-2 px-4 py-2 shadow-sm'
            placeholder='ej. Perez Apaolaza'
            required
          />
        </div>
        <div>
          <label htmlFor='phone' className='mb-2 block font-bold text-gray-700'>
            Teléfono
          </label>
          <input
            type='tel'
            id='phone'
            name='phone'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className='placeholder:text-muted-foreground border-foreground w-full border-2 px-4 py-2 shadow-sm'
            placeholder='ej. 221012345678'
            required
          />
        </div>
        <div className='-mt-3'>
          <label htmlFor='dni' className='block font-bold text-gray-700'>
            Foto DNI
          </label>
          <p className='text-sm text-gray-500'>
            Debe mostrarse el distintivo especial de Malvinas.
          </p>
          <input
            type='file'
            id='dni'
            name='dni'
            accept='image/*'
            onChange={(e) => setDni(e.target.files ? e.target.files[0] : null)}
            className='placeholder:text-muted-foreground border-foreground w-full border-2 px-4 py-2 shadow-sm'
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor='dni' className='mb-2 block font-bold text-gray-700'></label>
        <div className='border-foreground border-2 py-0 py-8'>
          <BlockNoteView editor={editor} theme={storedTheme === 'dark' ? 'dark' : 'light'} />
        </div>
      </div>
      <div className='flex items-center justify-center'>
        <button
          type='submit'
          className='bg-secondary border-primary text-primary mt-4 scale-110 border-2 px-4 py-2'
        >
          Enviar Formulario
        </button>
      </div>
    </form>
  )
}

export default RelatoForm
