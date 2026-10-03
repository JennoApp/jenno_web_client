import type { Actions } from './$types.js';
import { z, ZodError } from 'zod';
import { PRIVATE_SERVER_URL } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';

const shippingSchema = z.object({
    completeName: z
        .string({ required_error: 'Complete name is required' })
        .min(1, { message: 'Complete name is required' })
        .max(64, { message: 'Complete name must be less than 64 characters' })
        .trim(),

    document: z
        .string({ required_error: 'Document or NIT is required' })
        .min(1, { message: 'Document or NIT is required' })
        .max(32, { message: 'Document or NIT must be less than 32 characters' })
        .trim(),

    /**
     * Jenno opera actualmente en Colombia.
     *
     * Internamente enviamos "CO" al backend.
     */
    country: z
        .string({ required_error: 'Country is required' })
        .refine((value) => value.trim().toUpperCase() === 'CO', {
            message: 'Por ahora solo está disponible Colombia',
        }),

    address: z
        .string({ required_error: 'Address is required' })
        .min(1, { message: 'Address is required' })
        .max(64, { message: 'Address must be less than 64 characters' })
        .trim(),

    state: z
        .string({ required_error: 'State is required' })
        .min(1, { message: 'State is required' })
        .max(64, { message: 'State must be less than 64 characters' })
        .trim(),

    city: z
        .string({ required_error: 'City is required' })
        .min(1, { message: 'City is required' })
        .max(64, { message: 'City must be less than 64 characters' })
        .trim(),

    phoneNumber: z
        .string({ required_error: 'Phone number is required' })
        .min(1, { message: 'Phone number is required' })
        .max(64, { message: 'Phone number must be less than 64 characters' })
        .trim(),

    postalCode: z
        .string({ required_error: 'El código postal es requerido' })
        .trim()
        .regex(/^\d{6}$/, {
            message: 'El código postal debe tener exactamente 6 dígitos',
        }),
});

export const actions: Actions = {
    shipping: async ({ request, locals }: RequestEvent) => {
        const formData = Object.fromEntries(await request.formData());

        console.log(
            'Postal recibido:',
            JSON.stringify(formData.postalCode)
        );

        try {
            const parsedData = shippingSchema.parse({
                ...formData,

                /**
                 * Aunque el formulario contiene CO como hidden input,
                 * lo normalizamos nuevamente en backend.
                 */
                country: 'CO',
            });

            const {
                completeName,
                document,
                address,
                state,
                city,
                postalCode,
                phoneNumber,
            } = parsedData;

            const country = 'CO';

            console.log('Formulario de envío recibido:', {
                completeName,
                document,
                address,
                country,
                state,
                city,
                postalCode,
                phoneNumber,
            });

            const userId = locals?.user?._id;

            if (!userId) {
                return {
                    success: false,
                    errors: {
                        _form: ['No se pudo identificar al usuario.'],
                    },
                };
            }

            /**
             * Información actualmente guardada.
             */
            const currentShippingInfo = locals?.user?.shippingInfo;

            /**
             * Solo evitamos la llamada al backend si:
             *
             * 1. Los datos visibles no cambiaron.
             * 2. La ubicación ya fue validada.
             * 3. Existe cityDaneCode.
             *
             * Esto es importante para usuarios antiguos que
             * todavía no tengan cityDaneCode guardado.
             */
            const sameInformation =
                currentShippingInfo &&
                completeName === currentShippingInfo.completeName &&
                document === currentShippingInfo.document &&
                address === currentShippingInfo.address &&
                (state === currentShippingInfo.state ||
                    state === currentShippingInfo.state?.name) &&
                (city === currentShippingInfo.city ||
                    city === currentShippingInfo.city?.name) &&
                postalCode === currentShippingInfo.postalCode &&
                phoneNumber === currentShippingInfo.phoneNumber;

            const locationAlreadyVerified =
                currentShippingInfo?.locationVerified === true &&
                !!currentShippingInfo?.cityDaneCode;

            if (sameInformation && locationAlreadyVerified) {
                console.log(
                    'No se detectaron cambios y la ubicación ya está validada',
                );

                return {
                    success: true,
                };
            }

            /**
             * El frontend NO calcula el DANE.
             *
             * Solo enviamos los datos que conoce el usuario.
             *
             * UsersService -> LocationService -> Envia Geocodes
             * y allí se obtiene:
             *
             * cityDaneCode
             * stateCode2
             * stateCode3
             * locationVerified
             */
            const response = await fetch(
                `${PRIVATE_SERVER_URL}/users/shipping/${userId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        completeName,
                        document,
                        address,
                        country,
                        state,
                        city,
                        postalCode,
                        phoneNumber,
                    }),
                },
            );

            const result = await response.json();

            console.log('Respuesta del backend:', result);

            /**
             * El backend puede devolver:
             *
             * 400 -> código postal inválido
             * 400 -> ciudad no corresponde al código postal
             * 400 -> no se pudo obtener DANE
             * 500 -> error interno
             */
            if (!response.ok) {
                const backendMessage =
                    typeof result?.message === 'string'
                        ? result.message
                        : Array.isArray(result?.message)
                            ? result.message.join(', ')
                            : 'No fue posible guardar la información de envío.';

                return {
                    success: false,
                    errors: {
                        _form: [backendMessage],
                    },
                };
            }

            return {
                success: true,
            };
        } catch (err) {
            if (err instanceof ZodError) {
                const { fieldErrors } = err.flatten();

                return {
                    errors: fieldErrors,
                    success: false,
                };
            }

            console.error(
                'Error inesperado al procesar el formulario de envío:',
                err,
            );

            return {
                success: false,
                errors: {
                    _form: ['No fue posible procesar la información de envío.'],
                },
            };
        }
    },
};
