export function Skeleton() {
  return (
    <div className="rounded-sm border border-stroke bg-white px-7.5 pb-5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:pb-7.5">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-7 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      <div className="mb-3 border-b-2 border-stroke px-7.5 dark:border-strokedark">
        <div className="flex -mx-4">
          <div className="w-6/12 px-4 py-3">
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="w-2/12 px-4 py-3">
            <div className="h-5 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="w-2/12 px-4 py-3">
            <div className="h-5 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="w-2/12 px-4 py-3 text-center">
            <div className="mx-auto h-5 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center border-b border-stroke px-7.5 py-3 dark:border-strokedark">
            <div className="w-6/12 px-4">
              <div className="flex items-center">
                <div className="mr-4 h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div>
                  <div className="mb-1.5 h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>
            
            <div className="w-2/12 px-4">
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
            
            <div className="w-2/12 px-4">
              <div className="mb-1.5 h-4 w-14 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-3.5 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
            
            <div className="w-2/12 px-4 text-center">
              <div className="mx-auto h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}