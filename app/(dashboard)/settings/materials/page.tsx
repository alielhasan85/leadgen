import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import MaterialsManager from './materials-manager'

export default async function SettingsMaterialsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const materials = await prisma.material.findMany({
    where: { userId: session.user.id, deletedAt: null },
    select: { id: true, originalName: true, fileType: true, fileSizeBytes: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Marketing Materials</h1>
        <p className="text-zinc-500 mt-1">Upload the files the AI will use to write emails on your behalf.</p>
      </div>
      <MaterialsManager initialMaterials={materials} />
    </div>
  )
}
