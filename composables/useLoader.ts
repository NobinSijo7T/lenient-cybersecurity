export const useLoader = () => {
  const isLoading = useState('loader-visible', () => true)

  const showLoader = () => {
    isLoading.value = true
  }

  const hideLoader = () => {
    isLoading.value = false
  }

  const toggleLoader = () => {
    isLoading.value = !isLoading.value
  }

  return {
    isLoading,
    showLoader,
    hideLoader,
    toggleLoader
  }
}
