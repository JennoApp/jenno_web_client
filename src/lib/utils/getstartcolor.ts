
export const getStartColor = (rating: number) => {
    if (rating >= 5) {
      return 'text-yellow-600'
    } else if (rating >= 4.5) {
      return 'text-yellow-500'
    } else if (rating >= 3.5) {
      return 'text-yellow-400'
    } else if (rating >= 2.5) {
      return 'text-yellow-300'
    } else if (rating >= 1.5) {
      return 'text-yellow-200'
    } else if (rating >= 0.5) {
      return 'text-yellow-100'
    } else if (rating == 0) {
      return 'dark:text-gray-200'
    }
  }
