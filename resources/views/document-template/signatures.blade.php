<style>
@media print {
  .no-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
</style>


<div style="margin: 0; width: 100%; page-break-inside: avoid; break-inside: avoid; display: flex; justify-content: space-between; align-items: flex-start; gap: 50px; text-align: center; flex-wrap: nowrap;">
    @foreach ($signatures as $item)
        <div style="flex: 1;">
            {{-- Bloco fixo para assinatura (imagem ou espaço vazio) --}}
            <div style="height: 70px; display: flex; align-items: flex-end; justify-content: center;">
                @if (!empty($item['signature']))
                    <img style="max-height: 70px; object-fit: contain;" src="{!! $item['signature'] !!}" />
                @endif
            </div>

            {{-- Linha de assinatura alinhada --}}
            <hr style="border: none; border-top: 2px solid #000; margin: 6px auto;" />

            {{-- Nome abaixo da linha --}}
            <div style="font-size: 14px; font-weight: bold;">
                @if (!empty($item['name']))
                    Ass. {{ $item['name'] }}
                @else
                    Ass. do aluno
                @endif
            </div>

            {{-- Stamp (se existir) --}}
            @if (!empty($item['stamp']))
                <div>
                    <img style="max-height: 70px; object-fit: contain;" width="100%" src="{!! $item['stamp'] !!}"/>
                </div>
            @endif
        </div>
    @endforeach
</div>
