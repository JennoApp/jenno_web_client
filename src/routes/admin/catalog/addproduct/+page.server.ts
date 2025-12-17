import type { Actions } from './$types';
import { PRIVATE_SERVER_URL } from '$env/static/private';

export const actions: Actions = {
	saveProduct: async ({ request, cookies, fetch }) => {
		const formData = await request.formData();
		const uploadedFiles = formData.getAll('files') as File[];
		const tokenJwt = cookies.get('session');
		let productId = formData?.get('productId') as string;
		let imagesUrls = productId ? JSON.parse((formData.get('imagesUrls') as string) || '[]') : [];

		// Obtener y procesar el país
		const receivedCountries = ((formData.get('country') as string) || '')
			.split(',')
			.map((country) => country.trim());

		// Verificar y agregar "Colombia" si no está presente
		if (!receivedCountries.includes('Colombia')) {
			receivedCountries.unshift('Colombia');
		}

		const country = receivedCountries.length > 0 ? receivedCountries : ['Colombia'];

		const additionalInfo = formData.get('additionalInfo') as string;

		// ========== PROCESAR SIMPLE OPTIONS ==========
		const options: any[] = [];
		const simpleOptionsCount = parseInt((formData.get('simpleOptionsCount') as string) || '0');

		for (let i = 0; i < simpleOptionsCount; i++) {
			const name = formData.get(`simpleOption_${i}_name`) as string;
			const valuesStr = formData.get(`simpleOption_${i}_values`) as string;

			if (name && valuesStr) {
				const values = valuesStr.split('|||').filter((v) => v.trim());
				options.push({
					name: name.trim(),
					values: values
				});
			}
		}

		// ========== PROCESAR COMPLEX OPTIONS (VARIANTS) ==========
		const variants: any[] = [];
		const complexOptionsCount = parseInt((formData.get('complexOptionsCount') as string) || '0');

		for (let i = 0; i < complexOptionsCount; i++) {
			let vi = 0;
			while (true) {
				const optionName = formData.get(`variant_${i}_${vi}_optionName`) as string;
				if (!optionName) break; // No hay más valores para esta opción

				const label = formData.get(`variant_${i}_${vi}_label`) as string;
				const price = parseFloat((formData.get(`variant_${i}_${vi}_price`) as string) || '0');
				const stock = parseInt((formData.get(`variant_${i}_${vi}_stock`) as string) || '0');
				const sku = (formData.get(`variant_${i}_${vi}_sku`) as string) || '';
				const weight = parseFloat((formData.get(`variant_${i}_${vi}_weight`) as string) || '0');
				const color = (formData.get(`variant_${i}_${vi}_color`) as string) || '';

				variants.push({
					sku: sku,
					price: price,
					quantity: stock,
					options: [{ name: optionName, value: label }],
					weight: weight || undefined,
					meta: color ? { color } : {}
				});

				vi++;
			}
		}

		// ========== PROCESAR ESPECIFICACIONES ==========
		const especifications: any[] = [];
		for (let i = 0; i < 10; i++) {
			const title = formData.get(`especificationtitle${i}`);
			const content = formData.get(`especificationcontent${i}`);
			if (title && content) {
				especifications.push({
					title: title.toString(),
					content: content.toString()
				});
			}
		}

		// ========== CONSTRUIR PRODUCT DATA ==========
		const productData: any = {
			productname: formData.get('productname'),
			description: formData.get('description'),
			imgs: imagesUrls,
			price: parseFloat((formData.get('price') as string) || '0'),
			quantity: parseInt((formData.get('quantity') as string) || '0'),
			category: formData.get('category'),
			status: formData.get('status') || 'in_stock',
			visibility: formData.get('visibility') === 'true',
			country,
			additionalInfo,
			especifications
		};

		// Solo agregar options si hay
		if (options.length > 0) {
			productData.options = options;
		}

		// Solo agregar variants si hay
		if (variants.length > 0) {
			productData.variants = variants;
		}

		// Campos opcionales
		const sku = formData.get('SKU') as string;
		if (sku) productData.SKU = sku;

		const shippingfee = formData.get('shippingfee') as string;
		if (shippingfee) productData.shippingfee = parseFloat(shippingfee);

		const weight = formData.get('weight') as string;
		if (weight) productData.weight = parseFloat(weight);

		const length = formData.get('length') as string;
		const width = formData.get('width') as string;
		const height = formData.get('height') as string;
		if (length || width || height) {
			productData.dimensions = {
				length: length ? parseFloat(length) : undefined,
				width: width ? parseFloat(width) : undefined,
				height: height ? parseFloat(height) : undefined
			};
		}

		try {
			// ========== CREAR O ACTUALIZAR PRODUCTO ==========
			let response;
			if (!productId) {
				// Crear producto nuevo
				response = await fetch(`${PRIVATE_SERVER_URL}/products`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokenJwt}`
					},
					body: JSON.stringify(productData)
				});

				if (!response.ok) {
					const errorResponse = await response.json();
					console.error('Error al crear el producto:', errorResponse);
					return {
						success: false,
						status: response.status,
						errors: errorResponse
					};
				}

				const product = await response.json();
				console.log({ product });

				productId = product.productId;
				console.log('productId asignado:', productId);
			} else {
				// Actualizar producto existente
				response = await fetch(`${PRIVATE_SERVER_URL}/products`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokenJwt}`
					},
					body: JSON.stringify({
						productId,
						...productData
					})
				});

				if (!response.ok) {
					const errorResponse = await response.json();
					console.error('Error al actualizar el producto:', errorResponse);
					return {
						success: false,
						status: response.status,
						errors: errorResponse
					};
				}
			}

			// Esperar a que productId tenga un valor válido
			const waitForProductId = async () => {
				const maxRetries = 5;
				const retryDelay = 500;
				let retries = 0;

				while (!productId && retries < maxRetries) {
					await new Promise((resolve) => setTimeout(resolve, retryDelay));
					retries++;
				}

				if (!productId) {
					throw new Error('No se pudo obtener un productId válido.');
				}
			};

			await waitForProductId();

			// ========== SUBIR IMÁGENES ==========
			if (uploadedFiles.length > 0) {
				const imageFormData = new FormData();
				uploadedFiles.forEach((file) => {
					imageFormData.append('files', file);
				});

				const imageResponse = await fetch(
					`${PRIVATE_SERVER_URL}/products/upload-images/${productId}`,
					{
						method: 'POST',
						headers: {
							Authorization: `Bearer ${tokenJwt}`
						},
						body: imageFormData
					}
				);

				if (!imageResponse.ok) {
					const errorResponse = await imageResponse.json();
					throw new Error(errorResponse.message || 'Error al subir las imágenes');
				}

				const imageResult = await imageResponse.json();
				productData.imgs = imageResult.images;
			}

			return {
				success: true,
				status: 201,
				product: productData
			};
		} catch (error: any) {
			console.error('Error inesperado:', error);
			return {
				success: false,
				status: 500,
				errors: error.message
			};
		}
	}
};
