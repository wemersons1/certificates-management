@extends('emails.layout')

@section('title', 'Certificados e Documentos')

@section('body')
    <p style="font-size: 16px; line-height: 1.5; color: #555;">
        Olá, {!! explode(' ', $employee->name)[0] !!}
    </p>

    <p style="font-size: 16px; line-height: 1.5; color: #555;">
        Conforme sua solicitação, segue em anexo o(s) documento(s) de certificação.
    </p>

    <p style="font-size: 16px; line-height: 1.5; color: #555;">
        Qualquer dúvida, estamos à disposição.
    </p>
@endsection