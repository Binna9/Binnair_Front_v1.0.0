// import { useState, useEffect } from 'react';
// import {
//   fetchProductImage,
//   uploadProductImage,
// } from '@/services/ProductService';

// export function useProductImage(productId: string | null) {
//   const [productImage, setProductImage] = useState<string | null>(null);

//   useEffect(() => {
//     if (!productId) return;

//     const loadImage = async () => {
//       const imageUrl = await fetchProductImage(productId);
//       setProductImage(imageUrl);
//     };

//     loadImage();
//   }, [productId]);

//   const handleUpload = async (file: File) => {
//     if (!productId) return;
//     const imageUrl = await uploadProductImage(productId, file);
//     if (imageUrl) {
//       setProductImage(imageUrl);
//     }
//   };

//   return { productImage, uploadProductImage: handleUpload };
// }
