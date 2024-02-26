import { test, expect } from '@playwright/experimental-ct-react'
import { Detail } from '@/components/Detail'

// test.use({ viewport: { width: 500, height: 500 } });

test('should work', async ({ mount }) => {
  const component = await mount(<Detail activeEditors={[]} />)

  // console.log({ component: debug });

  // component.
  // await expect(component).toHaveText("Detail");
})
